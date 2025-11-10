import React from 'react';

// Простой Markdown парсер для базового форматирования
const MarkdownRenderer = ({ content, className = '' }) => {
  if (!content) return null;

  // Функция для парсинга Markdown в HTML
  const parseMarkdown = (text) => {
    if (typeof text !== 'string') return text;

    let html = text;

    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Жирный текст **text** или __text__
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

    // Курсив *text* или _text_
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');

    // Зачеркнутый текст ~~text~~
    html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

    // Ссылки [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Списки
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>');

    // Обертываем списки в ul/ol
    html = html.replace(/(<li>.*<\/li>)/gs, (match) => {
      const lines = match.split('\n');
      const listItems = lines.filter(line => line.trim().startsWith('<li>'));
      if (listItems.length > 0) {
        return `<ul>${listItems.join('')}</ul>`;
      }
      return match;
    });

    // Параграфы (двойной перенос строки)
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Одиночные переносы строк
    html = html.replace(/\n/g, '<br>');

    // Очищаем пустые параграфы
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p><br><\/p>/g, '');

    return html;
  };

  const htmlContent = parseMarkdown(content);

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default MarkdownRenderer;



