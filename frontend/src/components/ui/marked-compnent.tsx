import React from 'react';
import { marked } from 'marked';

const MarkdownRenderer = ({ markdown }) => {
  // Function to convert Markdown to HTML
  const renderMarkdown = (markdown) => {
    return { __html: marked.parse(markdown) };
  };

  return <div dangerouslySetInnerHTML={renderMarkdown(markdown)} />;
};

export default MarkdownRenderer;
