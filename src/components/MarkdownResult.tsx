import Markdown from 'react-markdown';

export const MarkdownResult = ({ content }: { content: string }) => {
  // Fix cases where AI generates "** text **", which breaks markdown parsing
  const processedContent = content
    ? content.replace(/\*\*([^*]+)\*\*/g, (match, p1) => `**${p1.trim()}**`)
    : '';

  return (
    <Markdown
      components={{
        strong: ({node, children, ...props}) => {
          const text = String(children);

          // Special handling for the Risk Level value
          if (text.toLowerCase() === 'none') {
            return <strong className="text-slate-800 bg-slate-200 px-2 py-0.5 rounded-md font-bold" {...props}>{children}</strong>;
          }
          if (text.toLowerCase() === 'low') {
            return <strong className="text-green-800 bg-green-100 px-2 py-0.5 rounded-md font-bold" {...props}>{children}</strong>;
          }
          if (text.toLowerCase() === 'moderate') {
            return <strong className="text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md font-bold" {...props}>{children}</strong>;
          }
          if (text.toLowerCase() === 'high') {
            return <strong className="text-red-800 bg-red-100 px-2 py-0.5 rounded-md font-bold" {...props}>{children}</strong>;
          }

          // Don't style the "Risk Level:" label itself
          if (text === 'Risk Level:') {
            return <strong className="font-bold" {...props}>{children}</strong>;
          }

          // Soft earth tones for other bolded words (Morandi / Wabi-Sabi)
          const colors = [
            'text-[#5C5446] bg-[#E8E4D9]', // Warm Stone
            'text-[#6B4C3A] bg-[#E3D5CA]', // Dusty Rose / Terracotta
            'text-[#3A5043] bg-[#D5DCD6]', // Sage Green
            'text-[#3B4D56] bg-[#D6DDE0]', // Slate Blue
            'text-[#635632] bg-[#E5DCC5]', // Muted Ochre
            'text-[#4A3E52] bg-[#DFD8E1]', // Dusty Lavender
          ];

          let hash = 0;
          for (let i = 0; i < text.length; i++) {
            hash = text.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colorIndex = Math.abs(hash) % colors.length;
          const colorClass = colors[colorIndex];

          return <strong className={`${colorClass} px-1.5 py-0.5 rounded-md font-bold box-decoration-clone`} {...props}>{children}</strong>;
        }
      }}
    >
      {processedContent}
    </Markdown>
  );
};
