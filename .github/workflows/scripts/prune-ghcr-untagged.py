#!/usr/bin/env python3
"""Delete orphaned untagged container versions from GHCR.

An untagged version is NOT necessarily garbage. A multi-arch tag is an OCI
index whose per-platform manifests and attestation manifests appear in the
packages API as untagged versions. Deleting those breaks `docker pull` for the
tag that points at them.

This script walks every *tagged* version's manifest, collects the digests they
reference (transitively), and only deletes untagged versions that nothing
reachable from a tag points to.

It can also prune whole throwaway dev builds: versions whose every tag looks
like a bare commit SHA. Anything matching PROTECT_RE (releases, latest) is
never touched, and orphan detection re-runs against the survivors so a pruned
dev build's children get collected in the same pass.

Env:
  GITHUB_TOKEN  token with read+delete on the package (required)
  OWNER         user or org that owns the package (required)
  PACKAGE       package name, e.g. "turtorial" (required)
  DRY_RUN       "true" (default) to report only, "false" to delete
  KEEP_DAYS     never delete anything newer than this many days (default 0)
  PRUNE_SHA_TAGS  "true" to also delete SHA-tagged dev builds (default false)
"""

import json
import os
import re
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone

API = "https://api.github.com"
REGISTRY = "ghcr.io"

INDEX_TYPES = {
    "application/vnd.oci.image.index.v1+json",
    "application/vnd.docker.distribution.manifest.list.v2+json",
}
MANIFEST_ACCEPT = ",".join(
    sorted(
        INDEX_TYPES
        | {
            "application/vnd.oci.image.manifest.v1+json",
            "application/vnd.docker.distribution.manifest.v2+json",
        }
    )
)


def fail(msg):
    print(f"::error::{msg}", file=sys.stderr)
    sys.exit(1)


def env(name, default=None, required=False):
    value = os.environ.get(name, default)
    if required and not value:
        fail(f"{name} is required")
    return value


TOKEN = env("GITHUB_TOKEN", required=True)
OWNER = env("OWNER", required=True)
PACKAGE = env("PACKAGE", required=True)
DRY_RUN = env("DRY_RUN", "true").lower() != "false"
KEEP_DAYS = int(env("KEEP_DAYS", "0"))
PRUNE_SHA_TAGS = env("PRUNE_SHA_TAGS", "false").lower() == "true"

# Never delete a version carrying one of these tags.
PROTECT_RE = re.compile(r"^(latest|v?\d+\.\d+\.\d+.*)$")
# A disposable dev build: bare commit SHA, optionally with an arch suffix.
SHA_TAG_RE = re.compile(r"^[0-9a-f]{7,40}(-(amd64|arm64))?$")


def api(path, method="GET"):
    request = urllib.request.Request(f"{API}{path}", method=method)
    request.add_header("Authorization", f"Bearer {TOKEN}")
    request.add_header("Accept", "application/vnd.github+json")
    request.add_header("X-GitHub-Api-Version", "2022-11-28")
    with urllib.request.urlopen(request) as response:
        if response.status == 204:
            return None
        return json.load(response)


def owner_scope():
    """Package endpoints differ for user- vs org-owned packages."""
    try:
        if api(f"/users/{OWNER}").get("type") == "Organization":
            return f"/orgs/{OWNER}"
    except urllib.error.HTTPError:
        pass
    # For a user-owned package the authenticated-user endpoint is the only one
    # that accepts a delete, so prefer it throughout.
    return "/user"


SCOPE = owner_scope()
VERSIONS_PATH = f"{SCOPE}/packages/container/{PACKAGE}/versions"


def list_versions():
    versions, page = [], 1
    while True:
        batch = api(f"{VERSIONS_PATH}?per_page=100&page={page}")
        if not batch:
            return versions
        versions.extend(batch)
        page += 1


def registry_token():
    url = (
        f"https://{REGISTRY}/token"
        f"?scope=repository:{OWNER}/{PACKAGE}:pull&service={REGISTRY}"
    )
    request = urllib.request.Request(url)
    # GHCR accepts the raw token base64'd as a bearer credential.
    import base64

    basic = base64.b64encode(f"{OWNER}:{TOKEN}".encode()).decode()
    request.add_header("Authorization", f"Basic {basic}")
    with urllib.request.urlopen(request) as response:
        return json.load(response)["token"]


def fetch_manifest(pull_token, digest):
    url = f"https://{REGISTRY}/v2/{OWNER}/{PACKAGE}/manifests/{digest}"
    request = urllib.request.Request(url)
    request.add_header("Authorization", f"Bearer {pull_token}")
    request.add_header("Accept", MANIFEST_ACCEPT)
    try:
        with urllib.request.urlopen(request) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        print(f"  ! could not read manifest {digest[:19]}: HTTP {error.code}")
        return None


def referenced_digests(pull_token, roots):
    """Every digest reachable from a tagged version, following index children."""
    seen, queue = set(), list(roots)
    while queue:
        digest = queue.pop()
        if digest in seen:
            continue
        seen.add(digest)
        manifest = fetch_manifest(pull_token, digest)
        if not manifest:
            continue
        if manifest.get("mediaType") in INDEX_TYPES:
            for child in manifest.get("manifests", []):
                child_digest = child.get("digest")
                if child_digest and child_digest not in seen:
                    queue.append(child_digest)
    return seen


def tags_of(version):
    return version.get("metadata", {}).get("container", {}).get("tags", [])


def created_at(version):
    return datetime.fromisoformat(version["created_at"].replace("Z", "+00:00"))


def show(heading, versions, note=""):
    if not versions:
        return
    print(f"{heading} ({len(versions)}){note}")
    for version in versions:
        tags = ", ".join(tags_of(version)) or "<untagged>"
        print(f"  {version['name'][:26]}  {version['created_at'][:10]}  {tags}")
    print()


def main():
    versions = list_versions()
    cutoff = datetime.now(timezone.utc) - timedelta(days=KEEP_DAYS)
    tagged = [v for v in versions if tags_of(v)]
    untagged = [v for v in versions if not tags_of(v)]

    print(f"{OWNER}/{PACKAGE}: {len(versions)} versions "
          f"({len(tagged)} tagged, {len(untagged)} untagged)\n")

    # Pass 1: pick off disposable SHA-tagged dev builds, so that pass 2 sees
    # them as gone and collects the manifests they were holding alive.
    doomed_tagged, kept_tagged = [], []
    for version in tagged:
        tags = tags_of(version)
        disposable = (
            PRUNE_SHA_TAGS
            and not any(PROTECT_RE.match(tag) for tag in tags)
            and all(SHA_TAG_RE.match(tag) for tag in tags)
            and created_at(version) <= cutoff
        )
        (doomed_tagged if disposable else kept_tagged).append(version)

    # Pass 2: anything untagged still reachable from a surviving tag must stay.
    print(f"Resolving manifests for {len(kept_tagged)} surviving tagged versions...")
    keep = referenced_digests(pull_token=registry_token(),
                              roots=[v["name"] for v in kept_tagged])
    print(f"{len(keep)} digests are reachable from a surviving tag.\n")

    protected = [v for v in untagged if v["name"] in keep]
    unreferenced = [v for v in untagged if v["name"] not in keep]
    too_new = [v for v in unreferenced if created_at(v) > cutoff]
    orphans = [v for v in unreferenced if created_at(v) <= cutoff]

    show("PROTECTED", protected, " - untagged but referenced by a surviving tag:")
    show("TOO NEW", too_new, f" - orphaned but newer than {KEEP_DAYS}d:")
    show("KEEPING", kept_tagged, " - tagged:")

    doomed = doomed_tagged + orphans
    if not doomed:
        print("Nothing to delete.")
        return

    show("DELETING" if not DRY_RUN else "WOULD DELETE", doomed_tagged,
         " - disposable SHA-tagged dev builds:")
    show("DELETING" if not DRY_RUN else "WOULD DELETE", orphans,
         " - orphaned untagged versions:")

    deleted = 0
    if not DRY_RUN:
        for version in doomed:
            try:
                api(f"{VERSIONS_PATH}/{version['id']}", method="DELETE")
                deleted += 1
            except urllib.error.HTTPError as error:
                if error.code == 403:
                    fail("403 from the delete endpoint. GITHUB_TOKEN often "
                         "cannot delete package versions; set a PACKAGES_TOKEN "
                         "secret (classic PAT, delete:packages) and retry.")
                print(f"  FAILED {version['name'][:26]}: HTTP {error.code}")
        print(f"Deleted {deleted}/{len(doomed)} versions.")
    else:
        print(f"Dry run - nothing deleted. Re-run with dry_run=false to "
              f"remove {len(doomed)} version(s).")

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as handle:
            handle.write(f"### GHCR prune: `{OWNER}/{PACKAGE}`\n\n")
            handle.write(f"| | |\n|---|---|\n")
            handle.write(f"| Versions before | {len(versions)} |\n")
            handle.write(f"| Protected (referenced by a tag) | {len(protected)} |\n")
            handle.write(f"| Dev builds pruned | {len(doomed_tagged)} |\n")
            handle.write(f"| Orphans pruned | {len(orphans)} |\n")
            handle.write(
                f"| Result | {'dry run, nothing deleted' if DRY_RUN else f'{deleted} deleted'} |\n")


if __name__ == "__main__":
    main()
