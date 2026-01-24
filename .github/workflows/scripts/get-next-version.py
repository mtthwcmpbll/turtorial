import os
import sys
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import base64

def get_next_version(bump_type):
    # Default version if nothing found
    current_version = "0.0.0"

    # URL for maven-metadata.xml in GitHub Packages
    # Structure: https://maven.pkg.github.com/OWNER/REPO/GROUP/ARTIFACT/maven-metadata.xml
    # Group com.snowfort -> com/snowfort
    # Artifact turtorial -> turtorial
    url = "https://maven.pkg.github.com/mtthwcmpbll/turtorial/com/snowfort/turtorial/maven-metadata.xml"

    token = os.environ.get('GITHUB_TOKEN')
    actor = os.environ.get('GITHUB_ACTOR')

    if token and actor:
        try:
            req = urllib.request.Request(url)
            # GitHub Packages often requires Basic Auth
            auth_str = f"{actor}:{token}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()
            req.add_header("Authorization", f"Basic {b64_auth}")

            with urllib.request.urlopen(req) as response:
                if response.status == 200:
                    tree = ET.parse(response)
                    root = tree.getroot()
                    # Find the <release> tag or <versioning><latest>
                    # <versioning><release>1.0.1</release>...</versioning>
                    versioning = root.find('versioning')
                    if versioning is not None:
                        release = versioning.find('release')
                        if release is not None:
                            current_version = release.text
                        else:
                            # Fallback to latest in versions list if release not specified
                            versions = versioning.find('versions')
                            if versions is not None:
                                version_list = [v.text for v in versions.findall('version')]
                                if version_list:
                                    current_version = version_list[-1] # Simple assumption: last is latest
        except urllib.error.HTTPError as e:
            if e.code == 404:
                # Package doesn't exist yet, start from 0.0.0
                pass
            else:
                # Some other error, print to stderr but don't fail, maybe default to 0.0.0?
                # Better to fail if it's an auth error (401/403)
                print(f"Error fetching metadata: {e}", file=sys.stderr)
                if e.code in (401, 403):
                     sys.exit(1)
        except Exception as e:
            print(f"Error processing metadata: {e}", file=sys.stderr)

    # Parse semver
    try:
        parts = list(map(int, current_version.split('.')))
        while len(parts) < 3:
            parts.append(0)
    except ValueError:
        print(f"Invalid version format found: {current_version}", file=sys.stderr)
        parts = [0, 0, 0]

    major, minor, patch = parts[0], parts[1], parts[2]

    if bump_type == 'major':
        major += 1
        minor = 0
        patch = 0
    elif bump_type == 'minor':
        minor += 1
        patch = 0
    elif bump_type == 'patch':
        patch += 1
    else:
        # Default to patch
        patch += 1

    new_version = f"{major}.{minor}.{patch}"
    print(new_version)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 get-next-version.py <bump_type>")
        sys.exit(1)

    bump_type = sys.argv[1].lower()
    get_next_version(bump_type)
