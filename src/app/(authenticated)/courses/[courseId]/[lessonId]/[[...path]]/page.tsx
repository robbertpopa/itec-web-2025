import { storage } from "lib/firebase";
import { ref, getMetadata, getDownloadURL } from "firebase/storage"
import { notFound, redirect, RedirectType } from "next/navigation";
import { NextResponse } from "next/server";
import { firebase } from "lib/firebaseServer";

interface Props {
    markdown?: string;
    children?: BucketFile[];
}

interface BucketFile {
    name: string
    mimeType?: string
    size: string
}

interface ParamsType {
    courseId: string
    lessonId: number
    path?: string[]
}

export default async function Page({ params }: { params: Promise<ParamsType> }) {
    const {
        courseId,
        lessonId,
        path
    } = await params;

    const bucket = firebase().storage().bucket();
    const fullPath = `courses/${courseId}/${lessonId}${path ? '/' + path.join('/') : ''}`

    const [files, ,apiResponse] = await bucket.getFiles({ prefix: fullPath + '/', delimiter: '/', autoPaginate: true })

    const prefixes = ((apiResponse as any).prefixes  ?? []) as any[]

    if (files.length + prefixes.length > 1) {
        files.shift();

        const mainFile = files.find(f => f.name == "main.md");
        const markdown = (await mainFile?.download())?.toString();

        const bucketFiles = files.map(f => ({
            name: f.name.split('/').filter(x => x != "").at(-1),
            mimeType: f.metadata.contentType == "application/x-www-form-urlencoded;charset=UTF-8" ? null : f.metadata.contentType,
            size: (f.metadata.size ?? 0).toString(),
        } as BucketFile))

        const prefixFiles = prefixes.map(p => ({
            name: p.split('/').filter(x => x != "").at(-1),
            size: '0',
        } as BucketFile))
        
        return render({
            markdown,
            children: [...prefixFiles, ...bucketFiles],
        });
    }

    let file = files.length == 1 ? files[0] : null;

    if (!file && (await bucket.file(fullPath).exists())[0]) {
        file = bucket.file(fullPath);
    }

    if (file) {
        if (file.metadata?.contentType == "text/markdown") {
            const [markdown] = await files[0].download();
            return render({
                markdown: markdown.toString("utf8")
            });
        }

        const [url] = await file.getSignedUrl(
            {
                action: "read",
                expires: Date.now() + 15 * 60 * 1000
            });


        redirect(url, RedirectType.replace);
    }


    notFound();
}

function render(props: Props) {
    return <>
        {props.markdown && <p>{props.markdown}</p>}
        {props.children && props.children.map(f => {
            return <div key={f.name}>
                <span>{f.name} {f.mimeType ?? "folder"} {f.size}</span>
            </div>
        })}
    </>
}
