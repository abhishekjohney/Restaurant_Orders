
import { GoX } from "react-icons/go";


const Sidebar = () => {

    return (

        <div className="fixed top-14 left-0 h-full bg-slate-700 hidden md:block  z-50">
                <label
                    htmlFor="my-drawer-3"
                    aria-label="close sidebar"
                    className="drawer-overlay"
                ></label>
                <ul className="menu p-4 w-80 min-h-full">
                    {/* Sidebar content here */}
                    <div className="flex-none relative">
                        <label
                            htmlFor="my-drawer-3"
                            aria-label="open sidebar"
                            className="btn btn-square btn-ghost "
                        >
                            
                      <GoX  className='text-white absolute right-0 h-6 w-6' />
                        </label>
                    </div>
                    <li>
                        <a>Sidebar Item 1</a>
                    </li>
                    <li>
                        <a>Sidebar Item 2</a>
                    </li>
                </ul>
            </div>

    )
}
export default Sidebar