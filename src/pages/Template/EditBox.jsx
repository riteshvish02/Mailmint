    
    import React, { useRef, useState } from 'react';
    import JoditEditor from 'jodit-react';

    const EditBox = ({ value = '', onChange }) => {
      const editor = useRef(null);
      const [content, setContent] = useState(value);

      const config = {
        readonly: false,
        height: 450,
        toolbarAdaptive: false,
        toolbarSticky: false,
        buttons: [
          // FILE/EDIT GROUP
          'undo', 'redo', '|',
          'source', '|',

          // FORMATTING GROUP
          'paragraph', 'fontsize', 'font', '|',
          'bold', 'italic', '|',
          'ul', 'ol', '|',
          'outdent', 'indent', '|',
          'align', '|',
          'quote', '|',

          // INSERT GROUP
          'link', 'image', 'table', 'emoji', '|',

          // VIEW GROUP
          'preview', 'fullsize', 'print', '|',

          // TOOLS
          'brush', 'hr', 'eraser', 'copyformat', '|',

          // ADVANCED/EXTENDED
          'selectall', 'symbol', 'dots'
        ],
        uploader: {
          insertImageAsBase64URI: true,
        },
        toolbarButtonSize: 'middle',
        showCharsCounter: true,
        showWordsCounter: true,
        showXPathInStatusbar: false,
        askBeforePasteHTML: false,
        askBeforePasteFromWord: false,
        useSearch: true,
      };

      return (
        <div className="border border-gray-300 rounded-md bg-white overflow-hidden">
          <JoditEditor
            ref={editor}
            value={content}
            config={config}
            onBlur={(newContent) => {
              setContent(newContent);
              onChange && onChange(newContent);
            }}
          />
        </div>
      );
    };

    export default EditBox;
