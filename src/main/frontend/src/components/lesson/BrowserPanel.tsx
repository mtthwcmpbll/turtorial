import { useState, useRef } from 'react';
import { RefreshCw, ArrowRight, Globe } from 'lucide-react';

interface BrowserPanelProps {
    initialUrl?: string;
}

export default function BrowserPanel({ initialUrl = 'https://example.com' }: BrowserPanelProps) {
    const [url, setUrl] = useState(initialUrl);
    const [inputUrl, setInputUrl] = useState(initialUrl);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let targetUrl = inputUrl;
        if (!targetUrl.match(/^https?:\/\//)) {
            targetUrl = 'https://' + targetUrl;
        }
        setUrl(targetUrl);
        setInputUrl(targetUrl);
    };

    const handleRefresh = () => {
        if (iframeRef.current) {
            iframeRef.current.src = url;
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white">
            <div className="flex items-center p-2 border-b border-white/10 bg-[#252526] gap-2">
                <button
                    onClick={handleRefresh}
                    className="p-1.5 rounded hover:bg-[#3e3e42] text-gray-400 hover:text-white transition-colors"
                    title="Refresh"
                >
                    <RefreshCw size={14} />
                </button>
                <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
                    <Globe size={14} className="absolute left-3 text-gray-500" />
                    <input
                        type="text"
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-1 text-sm bg-[#3e3e42] text-white border border-transparent rounded focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                        placeholder="Enter URL..."
                    />
                    <button type="submit" className="ml-2 p-1.5 rounded hover:bg-[#3e3e42] text-gray-400 hover:text-white transition-colors">
                        <ArrowRight size={14} />
                    </button>
                </form>
            </div>
            <div className="flex-1 relative bg-white">
                <iframe
                    ref={iframeRef}
                    src={url}
                    className="w-full h-full border-none"
                    title="Browser"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                />
            </div>
        </div>
    );
}
