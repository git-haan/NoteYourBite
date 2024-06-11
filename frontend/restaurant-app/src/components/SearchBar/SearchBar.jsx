import { FaMagnifyingGlass } from "react-icons/fa6"
import { IoMdClose } from "react-icons/io"

const SearchBar = ({ value, onChange, handleSearch, onClearSearch}) => {
    return(
        <div className="hidden sm:block">
        <div className="w-60 md:w-80 lg:w-[500px] flex items-center px-4 bg-slate-100 rounded-md">
            <input
                type="text"
                placeholder="Find Review"
                className="w-full text-xs bg-transparent py-[11px] outline-none"
                value={value}
                onChange={onChange}
            />

            {value && (
                <IoMdClose
                    className="text-xl text-slate-500 cursor-pointer hover:text-black mr-3"
                    onClick={onClearSearch}
                />
            )}
            <FaMagnifyingGlass
                className="text-slate-400 cursor-pointer hover:text-black"
                onClick={handleSearch}
            />
        </div>
        </div>
    )
}

export default SearchBar