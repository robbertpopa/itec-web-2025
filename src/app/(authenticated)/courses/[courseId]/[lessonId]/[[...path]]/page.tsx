import { notFound, redirect, RedirectType } from "next/navigation";
import { firebase } from "lib/firebaseServer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import Link from "next/link";

interface Props {
    markdown?: string;
    children?: BucketFile[];
    path: string
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

    const [files, , apiResponse] = await bucket.getFiles({ prefix: fullPath + '/', delimiter: '/', autoPaginate: true })

    const prefixes = ((apiResponse as any).prefixes ?? []) as any[]

    if (files.length + prefixes.length > 1) {
        files.shift();

        const mainFile = files.find(f => f.name.split('/').filter(x => x != "").at(-1) == "main.md");
        const markdown = (await mainFile?.download())?.toString();

        const bucketFiles = files.map(f => ({
            name: f.name.split('/').filter(x => x != "").at(-1),
            mimeType: f.metadata.contentType == "application/x-www-form-urlencoded;charset=UTF-8" ? null : f.metadata.contentType,
            size: (f.metadata.size ?? 0).toString(),
        } as BucketFile))

        const prefixFiles = prefixes.map(p => ({
            name: p.split('/').filter((x: string) => x != "").at(-1),
            size: '0',
        } as BucketFile))

        return <Component markdown={markdown} children={[...prefixFiles, ...bucketFiles]} path={fullPath} />;
    }

    let file = files.length == 1 ? files[0] : null;

    if (!file && (await bucket.file(fullPath).exists())[0]) {
        file = bucket.file(fullPath);
    }

    if (file) {
        if (file.name.split('.').at(-1) == "md") {
            const [markdown] = await file.download();
            return <Component markdown={markdown.toString("utf8")} path={fullPath}/>;
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

function Component(props: Props) {
    return <>
        {props.markdown && <MarkdownRenderer markdown={props.markdown} />}
        {props.children && props.children.map(f => {
            return <div key={f.name}>
                <span><Link className="link" href={'/' + props.path + '/' + f.name}>{f.name}</Link> {f.mimeType ?? "folder"} {f.size}</span>
            </div>
        })}
    </>
}
