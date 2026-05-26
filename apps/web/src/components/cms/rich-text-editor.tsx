"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { useCallback, useEffect } from "react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Code2,
  Link2, Image, Minus, Undo, Redo,
  Table as TableIcon, Rows3, Rows4, Trash2, Columns3, Columns4,
  ListPlus, SquareSplitVertical,
} from "lucide-react";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

const ToolbarButton = ({
  onClick, active, title, children,
}: {
  onClick: () => void;
  active: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={`rounded-lg p-1.5 transition-colors ${
      active
        ? "bg-blue-100 text-blue-700"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-0.5 h-5 w-px bg-zinc-200" />;

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: { HTMLAttributes: { class: "rounded-lg bg-zinc-900 text-zinc-100 p-4 text-sm font-mono" } },
      }),
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      ImageExtension.configure({ inline: false, allowBase64: false }),
      Underline,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3",
      },
    },
  });

  const toggleLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Image URL", "https://");
    if (url && url !== "https://") {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  const addRowAfter = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const deleteRow = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteRow().run();
  }, [editor]);

  const addColumnAfter = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const deleteColumn = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  const toggleHeaderRow = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().toggleHeaderRow().run();
  }, [editor]);

  const mergeCells = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().mergeCells().run();
  }, [editor]);

  const splitCell = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().splitCell().run();
  }, [editor]);

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={toggleLink}
          active={editor.isActive("link")}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={addImage}
          active={editor.isActive("image")}
          title="Image"
        >
          <Image className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          active={false}
          title="Divider"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          onClick={insertTable}
          active={editor.isActive("table")}
          title="Insert Table"
        >
          <TableIcon className="h-4 w-4" />
        </ToolbarButton>
        {editor.isActive("table") && (
          <>
            <ToolbarButton
              onClick={addRowAfter}
              active={false}
              title="Add Row"
            >
              <Rows4 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteRow}
              active={false}
              title="Delete Row"
            >
              <Trash2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={addColumnAfter}
              active={false}
              title="Add Column"
            >
              <Columns4 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteColumn}
              active={false}
              title="Delete Column"
            >
              <Columns3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={toggleHeaderRow}
              active={false}
              title="Toggle Header"
            >
              <Rows3 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={mergeCells}
              active={false}
              title="Merge Cells"
            >
              <ListPlus className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={splitCell}
              active={false}
              title="Split Cell"
            >
              <SquareSplitVertical className="h-4 w-4" />
            </ToolbarButton>
          </>
        )}
        <Divider />
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          active={false}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          active={false}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
