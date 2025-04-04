export default async function Page() {
    return (
        <form className="shadow-lg rounded-md border border-neutral/10 p-10 w-full max-w-100">
            <div className="text-center mb-5">
                <h2 className="text-xl font-semibold">
                    OfCoursly
                </h2>
                <h3 className="text-sm font-thin opacity-80">
                    Your learning platform
                </h3>
            </div>
            <h3 className="">
                Welcome back
            </h3>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Email</legend>
                <input type="text" className="input" placeholder="johndoe@example.com" />
            </fieldset>
            <fieldset className="fieldset">
                <legend className="fieldset-legend">Password</legend>
                <input type="text" className="input" placeholder="very secret password" />
            </fieldset>
        </form>
    )
}
