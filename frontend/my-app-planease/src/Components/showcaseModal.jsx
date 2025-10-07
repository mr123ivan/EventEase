import React, { useState, useEffect } from "react";
import axios from "axios";

const ShowcaseModal = ({ title, subcontractorId, onClose }) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [previewState, setPreviewState] = useState({ visible: false, images: [], index: 0 });
    const [subcontractor, setSubcontractor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/subcontractor/${subcontractorId}`);
                setSubcontractor(res.data);
                console.log(res.data);
            } catch (error) {
                console.error("Failed to fetch subcontractor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [subcontractorId]);

    useEffect(() => {
        if (previewState.visible) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = ''; // restore on unmount
        };
    }, [previewState.visible]);

    const openImagePreview = (images, index) => {
        setPreviewState({ visible: true, images, index });
    };

    const nextImage = () => {
        setPreviewState((prev) => ({
            ...prev,
            index: (prev.index + 1) % prev.images.length,
        }));
    };

    const prevImage = () => {
        setPreviewState((prev) => ({
            ...prev,
            index: (prev.index - 1 + prev.images.length) % prev.images.length,
        }));
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto px-2 py-10">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl mx-auto p-4 sm:p-6 relative min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-[#FFB22C] border-solid"></div>
                        </div>
                    ) : (
                        subcontractor && (
                            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                                {/* Profile Section */}
                                <div className="bg-white border shadow-md rounded-lg p-4 w-full md:max-w-xs text-center">
                                    {subcontractor?.user?.profilePicture ? (
                                        <img
                                            src={subcontractor.user.profilePicture}
                                            alt="Profile"
                                            className="w-20 h-20 sm:w-24 2sm:h-24 rounded-full mx-auto mb-3 object-cover"
                                        />
                                    ) : (
                                        <img
                                            src="/profile1.png?height=200&width=200"
                                            alt="Default Profile"
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mx-auto mb-3 object-cover"
                                        />
                                    )}
                                    <h3 className="font-semibold text-lg">{subcontractor.subcontractor_serviceCategory}</h3>
                                </div>

                                {/* Showcase Section */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <h2 className="text-xl sm:text-2xl font-semibold text-[#FFB22C]">Showcase</h2>
                                        <button
                                            onClick={onClose}
                                            className="text-2xl sm:text-3xl text-gray-500 hover:text-black"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <h3 className="font-semibold text-lg mb-1">About us</h3>
                                        <p className="text-sm text-gray-700">{subcontractor.subcontractor_description}</p>
                                    </div>

                                    {subcontractor.showcase?.map((section, idx) => (
                                        <div key={idx} className="mb-6">
                                            <h4 className="font-semibold text-md mb-1">{section.showcase_title}</h4>
                                            <p className="text-sm text-gray-700 mb-3">{section.showcase_description}</p>
                                            <div className="flex gap-3 overflow-x-auto pb-1">
                                                {section.showcaseMediaEntity?.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img.showcaseMedia_imageurl}
                                                        alt={img.showcaseMedia_fileName}
                                                        className="w-28 h-20 object-cover rounded-md cursor-pointer hover:opacity-80 shrink-0"
                                                        onClick={() =>
                                                            openImagePreview(
                                                                section.showcaseMediaEntity.map((m) => m.showcaseMedia_imageurl),
                                                                i
                                                            )
                                                        }
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Fullscreen Image Preview Carousel */}
            {previewState.visible && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4">
                    <button
                        className="absolute left-4 text-white text-4xl sm:text-5xl hover:scale-110"
                        onClick={prevImage}
                    >
                        &#10094;
                    </button>
                    <img
                        src={previewState.images[previewState.index]}
                        alt="Preview"
                        className="max-h-[80vh] max-w-full rounded-lg"
                    />
                    <button
                        className="absolute right-4 text-white text-4xl sm:text-5xl hover:scale-110"
                        onClick={nextImage}
                    >
                        &#10095;
                    </button>
                    <button
                        className="absolute top-5 right-6 text-white text-3xl"
                        onClick={() => setPreviewState({ ...previewState, visible: false })}
                    >
                        &times;
                    </button>
                </div>
            )}
        </>
    );
};

export default ShowcaseModal;
