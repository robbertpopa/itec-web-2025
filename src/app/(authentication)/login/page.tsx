export default async function Page() {
    return (
        <form className="card bg-primary-500 shadow-md rounded-sm">
            <div className="card-body">
                <h2 className="card-title">
                    Log In
                </h2>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Email</legend>
                    <input type="text" className="input" placeholder="johndoe@example.com" />
                </fieldset>
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Password</legend>
                    <input type="text" className="input" placeholder="very secret password" />
                </fieldset>
            </div>
        </form>
    )
}
