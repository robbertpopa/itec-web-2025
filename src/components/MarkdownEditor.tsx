'use client'

import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MarkdownEditor() {
    const [md, setMd] = useState<string>("");

    return (
        <div className="size-full flex flex-row gap-1">
            <textarea
                className="textarea flex-1 h-full"
                placeholder="# Hello, world!"
                value={md}
                onChange={(e) => setMd(e.target.value)} />
            <MarkdownRenderer markdown={md} className="flex-1" />
        </div>
    );
}
