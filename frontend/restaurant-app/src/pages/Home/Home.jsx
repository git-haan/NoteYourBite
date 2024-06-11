import NoteCard from "../../components/Cards/NoteCard";
import Navbar from "../../components/Navbar/Navbar";
import { MdAdd } from "react-icons/md";
import NoteEdit from "./NoteEdit";
import { useEffect, useState } from "react";
import Modal from "react-modal"
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Toast from "../../components/ToastMessage/Toast";
import EmptyCard from "../../components/Cards/EmptyCard";

const Home = () => {

    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown: false,
        type: "add",
        data: null,
    });

    const [showToastMsg, setShowToastMsg] = useState({
        isShown: false,
        message: "",
        type: "add"
    });

    const [allNotes, setAllNotes] = useState([]);
    const [userInfo, setUserInfo] = useState(null);

    const [ isSearch, setIsSearch ] = useState(false);


    const navigate = useNavigate();

    const handleEdit = (noteDetails) => {
        setOpenAddEditModal({ isShown: true, data: noteDetails, type: "edit"});
    };

    const showToastMessage = (message, type) => {
        setShowToastMsg({ isShown: true, message, type });
    };

    const handleCloseToast = () => {
        setShowToastMsg({ isShown: false, message: ""});
    };

    // Get user info
    const getUserInfo = async () => {
        try {
            const response = await axiosInstance.get("/get-user");
            if (response.data && response.data.user) {
                setUserInfo(response.data.user);
            }
        } catch (error) {
            if (error.response.status === 401) {
                localStorage.clear();
                navigate("/login");
            }
        }
    };

    // Get all notes
    const getAllNotes = async () => {
        try {
            const response = await axiosInstance.get("/get-all-notes");

            if (response.data && response.data.notes) {
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.log("An unexpected error occurred. Please try again later.");
        }
    }

    // Delete note
    const deleteNote = async (data) => {
        try {
            const response = await axiosInstance.delete("/delete-note/" + data._id);

            if (response.data && !response.data.error) {
                showToastMessage("Note Deleted Successfully", "delete");
                getAllNotes();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                showToastMessage("An unexpected error occurred. Please try again later.");
            }
        }
    };

    // Search note
    const onSearchNote = async (query) => {
        try {
            const response = await axiosInstance.get("/search-notes", {
                params: { query },
            });

            if (response.data && response.data.notes) {
                setIsSearch(true);
                setAllNotes(response.data.notes);
            } 
        } catch (error) {
            console.log("An unexpected error occurred. Please try again later.")
        }
    };

    // Pin note
    const updateIsPinned = async (noteId, isPinned) => {
        try {
            const response = await axiosInstance.put("/update-note-pinned/" + noteId, { isPinned });

            if (response.data && response.data.note) {
                showToastMessage("Note Updated Successfully", "update");
                getAllNotes();
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                showToastMessage("An unexpected error occurred. Please try again later.");
            }
        }
    };

    const handleClearSearch = () => {
        setIsSearch(false);
        getAllNotes();
    };


    useEffect(() => {
        getAllNotes();
        getUserInfo();

        return () => {};
    }, []);

    return (
        <>
            <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>

            <div className="container mx-auto px-10">
                {allNotes.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4 mt-8">
                        {allNotes.map((item) => (
                            <NoteCard 
                                key={item._id}
                                title={item.title}
                                date={item.createdOn} 
                                content={item.content}
                                tags={item.tags}
                                isPinned={item.isPinned}
                                onEdit={() => handleEdit(item)}
                                onDelete={() => deleteNote(item)}
                                onPinNote={() => updateIsPinned(item._id, !item.isPinned)}
                            />
                        ))}
                    </div>) : (
                        <EmptyCard message={isSearch ? `Oops. No notes found matching your search.` : `It looks like there are no reviews yet. Create your first review and share your dining experience. Click the 'Add' button to jot down your thoughts, whether it's praise or constructive criticism. Pro Tip: Be sure to add the right tags!`}/>
                    )
                }
            </div>

            <button 
                className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10" 
                onClick={() => {
                    setOpenAddEditModal({ isShown: true, type: "add", data: null });
                }}
            >
                <MdAdd className="text-3xl text-white" />

            </button>

            <Modal
                isOpen = {openAddEditModal.isShown}
                onRequestClose={()=> {}}
                style={{
                    overlay: {
                        backgroundColor: "rgba(0,0,0,0.2)",
                    },
                }}
                contentLabel=""
                className="w-[60%] md:w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5"
                appElement={document.getElementById("root")}
            >
                <NoteEdit
                    type={openAddEditModal.type}
                    noteDate={openAddEditModal.data}
                    onClose={() => {
                        setOpenAddEditModal({ isShown: false, type: "add", data: null });
                    }}
                    getAllNotes={getAllNotes}
                    showToastMessage={showToastMessage}
                />
            </Modal>

            <Toast
                isShown={showToastMsg.isShown}
                message={showToastMsg.message}
                type={showToastMsg.type}
                onClose={handleCloseToast}
            />
        </>
    );
}

export default Home;