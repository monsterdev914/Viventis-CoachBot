import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="prose prose-invert max-w-none">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code: ({ node, inline, className, children, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={vscDarkPlus}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                    borderRadius: '0.5rem',
                                    fontSize: '0.95em',
                                    margin: 0,
                                }}
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code
                                className={`${className} bg-[#1E1E1E] text-[#D4D4D4] rounded px-1 py-0.5 font-mono text-sm`}
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },
                    // Style pre blocks
                    pre({ node, children, ...props }) {
                        return (
                            <pre
                                className="bg-[#1E1E1E] rounded-lg p-4 overflow-x-auto font-mono text-sm"
                                {...props}
                            >
                                {children}
                            </pre>
                        );
                    },
                    // Style links
                    a({ node, children, ...props }) {
                        return (
                            <a
                                className="text-blue-400 hover:text-blue-300 underline"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    // Style lists
                    ul({ node, children, ...props }) {
                        return (
                            <ul className="list-disc pl-6 space-y-2" {...props}>
                                {children}
                            </ul>
                        );
                    },
                    ol({ node, children, ...props }) {
                        return (
                            <ol className="list-decimal pl-6 space-y-2" {...props}>
                                {children}
                            </ol>
                        );
                    },
                    // Style blockquotes
                    blockquote({ node, children, ...props }) {
                        return (
                            <blockquote
                                className="border-l-4 border-gray-600 pl-4 italic"
                                {...props}
                            >
                                {children}
                            </blockquote>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer; 