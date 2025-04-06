"use client"

import { marked } from "marked";
import { useEffect, useRef } from "react";
import DOMPurify from 'dompurify';
import "./markdown-renderer.css";

interface MarkdownRendererProps {
    markdown: string
    className?: string
}

export default function MarkdownRenderer({ markdown, className = "" }: MarkdownRendererProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => { handleMardownChange() }, [markdown])

    const handleMardownChange = async () => {
        if (!ref.current)
            return;

        ref.current.innerHTML =
            DOMPurify.sanitize(await marked.parse(markdown))
    }

    return <div ref={ref} className={`markdown-body ${className}`}></div>
}
