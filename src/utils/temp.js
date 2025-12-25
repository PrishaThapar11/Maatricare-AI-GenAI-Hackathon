export default function formatAIText(text) {
  if (!text) return "";

  return text
    // Convert markdown headers to HTML
    .replace(/### (.*?)(\n|$)/g, '<h4>$1</h4>')
    .replace(/## (.*?)(\n|$)/g, '<h3>$1</h3>')
    .replace(/# (.*?)(\n|$)/g, '<h2>$1</h2>')
    
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="highlight">$1</strong>')
    
    // Convert bullet points
    .replace(/^\s*[-•]\s+(.*?)$/gm, '<li>$1</li>')
    
    // Wrap consecutive list items in <ul>
    .replace(/(<li>.*?<\/li>\s*)+/gs, '<ul>$&</ul>')
    
    // Convert line breaks to paragraphs
    .replace(/\n\n+/g, '</p><p>')
    .replace(/^(.+)$/gm, '<p>$1</p>')
    
    // Clean up nested tags
    .replace(/<p><h([1-4])>/g, '<h$1>')
    .replace(/<\/h([1-4])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><li>/g, '<li>')
    .replace(/<\/li><\/p>/g, '</li>')
    
    // Remove empty paragraphs
    .replace(/<p>\s*<\/p>/g, '');
}