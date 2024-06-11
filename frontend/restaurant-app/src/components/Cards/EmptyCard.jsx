
const EmptyCard = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center mt-40">
            <p className="w-1/2 text-sm font-medium text-slate-700 text-center leading-7">
                {message}
            </p>
        </div>
    )
}

export default EmptyCard