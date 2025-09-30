import { useState, useRef, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import Navbar from "../../Components/Navbar";
import Typography from '@mui/material/Typography';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import NavPanel from "../../Components/subcon-navpanel";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import imageCompression from 'browser-image-compression';
import '../../index.css';
import { Box, IconButton, Modal, Stack, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const SubcontractorDashboard = () => {

    // Get JWT from localStorage and decode it
    const token = localStorage.getItem('token');
    const decoded = token ? jwtDecode(token) : null;
    const [email, setEmail] = useState(decoded?.email || '');
    const [showcase, setShowcase] = useState([]);

    const MAX_IMAGE_COUNT = 5;
    const MAX_VIDEO_COUNT = 1;
    const [error,setError] = useState(null);
    const [selectVideo, setSelectedVideo] = useState(null);
    const [deletedFileIds, setDeletedFileIds] = useState([]);

    //this variable is for clicking the images in post
    const [activeGallery, setActiveGallery] = useState(null); // { images: [], index: 0 }

    const [isEditingAbout, setIsEditingAbout] = useState(false);
    const [isEditingShowcase, setIsEditingShowcase] = useState(false);
    const [editingShowcaseId, setEditingShowcaseId] = useState(null);

    const [open, setOpen] = useState(false);
    const [editMediaOpen, setEditMediaOpen] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [showcaseToDelete, setShowcaseToDelete] = useState(null);

    const [menuOpenIndex, setMenuOpenIndex] = useState(null);

    const [itemData, setItemData] = useState([]);
    const [selectedImage, setSelectedImage] = useState([]);
    const [selectedImageLenght, setSelectedImageLenght] = useState(0);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [about, setAbout] = useState('');
    const [userdetails, setUserDetails] = useState({
        fullname: '',
        email: '',
        service_name: '',
        profile_image: ''
    });
    const [imageUrl, setImageUrl] = useState([]);

    // Overview state variables
    const [assignedEvents, setAssignedEvents] = useState(0);
    const [activeTransactions, setActiveTransactions] = useState(0);
    const [completedTransactions, setCompletedTransactions] = useState(0);
    const [recentActivity, setRecentActivity] = useState([]);
    const [isLoadingOverview, setIsLoadingOverview] = useState(false);

    useEffect(()=>{
        console.log("selectedImage", selectedImage);
    },[selectedImage])

    const handleOpen = () => setOpen(true);


    const handleEdit = (item) => {
        setTitle(item.showcase_title);
        setDescription(item.showcase_description);
        setSelectedImage(item.showcaseMediaEntity.map(media => ({
            id: media.showcaseMedia_id,
            title: media.showcaseMedia_fileName,
            image: media.showcaseMedia_imageurl,
            file: null // read-only for existing files; replace only if changed
        })));
        setSelectedImageLenght(item.showcaseMediaEntity.length);
        setEditingShowcaseId(item.showcase_id);
        setIsEditingShowcase(true);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setTitle('');
        setDescription('');
        setSelectedImage([]);
        setSelectedImageLenght(0);
        setSelectedVideo(null);
        setIsEditingShowcase(false);
        setEditingShowcaseId(null);
        setError(null);
        setUploadError('');
        setDeletedFileIds([]); // ✅ clear on close
    };

    const handleSubmitDescription = () => {
        console.log("description", description);
        setIsEditingAbout(false);

        // Submit the updated description
        axios.put('http://54.255.151.41:8080/subcontractor/edit-description', {
                email: email,
                description: description
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        ).then(res => {
            if (res.status === 200) {
                setAbout(description); // Update the local 'about' state to reflect changes
            } else {
                console.error("Failed to update description, unexpected response status:", res.status);
            }
        }).catch(err => {
            console.error("Error updating description:", err);
        });
    }

    const theme = useTheme();
    const dropRef = useRef(null);

    useEffect(() => {
        console.log("deletedFileIds", deletedFileIds);
    },[deletedFileIds])

    const handleRemoveImage = (indexToRemove) => {
        const removedItem = selectedImage[indexToRemove];

        console.log(indexToRemove);
        console.log("removedItem: ", removedItem);

        if (removedItem?.id) {
            setDeletedFileIds((prev) => [...prev, removedItem.id]);
        }

        setSelectedImage((prev) => prev.filter((_, i) => i !== indexToRemove));
        setError(null);
    };

    useEffect(() => {
        fetchShowcaseData();
    }, []);

    const fetchShowcaseData = () => {
        axios.get(`http://54.255.151.41:8080/subcontractor/getdetails/${email}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then((response) => {
                console.log("response", response);

                const user = response.data.user;

                setShowcase(response.data.showcase);
                setAbout(response.data.subcontractor_description);
                console.log(user)
                setUserDetails({
                    fullname: `${user.firstname} ${user.lastname}`,
                    email: user.email,
                    service_name: response.data.subcontractor_serviceName,
                    profile_image: user.profilePicture
                });

                // After getting user details, fetch overview data
                fetchOverviewData(user.email);
            })
            .catch((error) => {
                console.log("Error fetching user details:", error);
            });
    }
    
    // Fetch overview data for the subcontractor dashboard
    const fetchOverviewData = (subcontractorEmail) => {
        setIsLoadingOverview(true);
        
        // Get assigned events count and transactions
        axios.get(`http://54.255.151.41:8080/api/transactions/getTransactionByEmail/${subcontractorEmail}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            console.log("Subcontractor transactions:", response.data);
            
            if (response.data) {
                const transactions = response.data;
                
                // Count assigned events (unique events the subcontractor is assigned to)
                // Using eventName since eventId is not available in the response
                const uniqueEvents = [...new Set(transactions.map(t => t.eventName))];
                console.log("Unique events:", uniqueEvents);
                setAssignedEvents(uniqueEvents.length);
                
                // Count transactions by status
                // Using transactionStatus field from backend
                // Status enum in Java: COMPLETED, DECLINED, CANCELLED, PENDING, ONGOING
                console.log("Transaction statuses:", transactions.map(t => t.transactionStatus));
                
                const active = transactions.filter(t => t.transactionStatus === "ONGOING" || t.transactionStatus === "PENDING").length;
                const completed = transactions.filter(t => t.transactionStatus === "COMPLETED").length;
                
                console.log("Active transactions:", active);
                console.log("Completed transactions:", completed);
                
                setActiveTransactions(active);
                setCompletedTransactions(completed);
                
                // Get recent activity (latest 5 transactions)
                // Using transactionDate field from backend for sorting
                const sortedByDate = [...transactions].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
                console.log("Sorted recent activity:", sortedByDate.slice(0, 5));
                setRecentActivity(sortedByDate.slice(0, 5));
            }
            
            setIsLoadingOverview(false);
        })
        .catch(error => {
            console.error("Error fetching subcontractor overview data:", error);
            setIsLoadingOverview(false);
        });
    }

    const resizeImage = async (
        file,
        maxWidth = 1920,
        maxHeight = 1080,
        sizeLimitMB = 10,
        quality = 0.8
    ) => {
        const originalSizeMB = file.size / 1024 / 1024;

        const originalMeta = {
            width: null,  // will be filled after loading
            height: null,
            sizeKB: file.size / 1024,
            sizeMB: originalSizeMB,
        };

        const loadImageDimensions = () =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    originalMeta.width = img.width;
                    originalMeta.height = img.height;
                    resolve();
                };
                img.src = URL.createObjectURL(file);
            });

        await loadImageDimensions();

        if (originalSizeMB <= sizeLimitMB) {
            return {
                resizedFile: file,
                original: originalMeta,
                resized: { ...originalMeta },
            };
        }

        const options = {
            maxSizeMB: sizeLimitMB,
            maxWidthOrHeight: Math.max(maxWidth, maxHeight), // maintain aspect ratio
            useWebWorker: true,
            initialQuality: quality,
        };

        const compressedFile = await imageCompression(file, options);
        const compressedSizeKB = compressedFile.size / 1024;
        const compressedSizeMB = compressedSizeKB / 1024;

        return {
            resizedFile: compressedFile,
            original: originalMeta,
            resized: {
                width: null, // final resized dimensions not available directly
                height: null,
                sizeKB: compressedSizeKB,
                sizeMB: compressedSizeMB,
            },
        };
    };

    // const resizeImage = (file, maxWidth = 1920, maxHeight = 1080, sizeLimitMB = 10, quality = 0.8) => {
    //     return new Promise((resolve) => {
    //         const img = new Image();
    //         const canvas = document.createElement('canvas');
    //         const reader = new FileReader();
    //
    //         reader.onload = (e) => {
    //             img.onload = () => {
    //                 const originalWidth = img.width;
    //                 const originalHeight = img.height;
    //                 const originalSizeKB = file.size / 1024;
    //                 const originalSizeMB = originalSizeKB / 1024; // Convert size to MB
    //
    //                 // Check if compression is needed based on size
    //                 if (originalSizeMB <= sizeLimitMB) {
    //                     // If file is smaller than or equal to the size limit, no compression needed
    //                     resolve({
    //                         resizedFile: file,
    //                         original: {
    //                             width: originalWidth,
    //                             height: originalHeight,
    //                             sizeKB: originalSizeKB,
    //                             sizeMB: originalSizeMB,
    //                         },
    //                         resized: {
    //                             width: originalWidth,
    //                             height: originalHeight,
    //                             sizeKB: originalSizeKB,
    //                             sizeMB: originalSizeMB,
    //                         },
    //                     });
    //                     return;
    //                 }
    //
    //                 // Calculate scaled dimensions (only if resizing is needed)
    //                 const ratio = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);
    //                 const newWidth = Math.round(originalWidth * ratio);
    //                 const newHeight = Math.round(originalHeight * ratio);
    //
    //                 // Resize using canvas
    //                 canvas.width = newWidth;
    //                 canvas.height = newHeight;
    //                 const ctx = canvas.getContext('2d');
    //                 ctx.drawImage(img, 0, 0, newWidth, newHeight);
    //
    //                 // Compress the image with quality control only if it's larger than the size limit
    //                 canvas.toBlob((blob) => {
    //                     const resizedFile = new File([blob], file.name, { type: file.type });
    //                     const resizedSizeKB = resizedFile.size / 1024;
    //                     const resizedSizeMB = resizedSizeKB / 1024;
    //
    //                     resolve({
    //                         resizedFile,
    //                         original: {
    //                             width: originalWidth,
    //                             height: originalHeight,
    //                             sizeKB: originalSizeKB,
    //                             sizeMB: originalSizeMB,
    //                         },
    //                         resized: {
    //                             width: newWidth,
    //                             height: newHeight,
    //                             sizeKB: resizedSizeKB,
    //                             sizeMB: resizedSizeMB,
    //                         },
    //                     });
    //                 }, file.type, quality); // Apply compression if the file is large
    //             };
    //
    //             img.src = e.target.result;
    //         };
    //
    //         reader.readAsDataURL(file);
    //     });
    // };

    const performDelete = (showcase_id) => {
        axios.delete(`http://54.255.151.41:8080/showcase/delete/${showcase_id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
        })
            .then(() => {
                fetchShowcaseData();
                setConfirmDeleteOpen(false);  // close the modal
                setShowcaseToDelete(null);    // reset selection
            })
            .catch((error) => {
                console.error("Error deleting showcase:", error);
            });
    };

    const handleSubmit = async () => {
        setIsUploading(true);
        setUploadError('');

        if (!selectVideo) {
            console.log(isEditingShowcase ? "updating image showcase" : "submitting new image showcase");
            console.log(selectedImage);
            //need optimization <-----
            const resizedImages = await Promise.all(
                selectedImage.map(async (img) => {
                    if (!img.file) {
                        // Reuse existing image (already uploaded, not replaced)
                        return {
                            image: img.image,
                            title: img.title,
                            file: null,
                            existing: true,
                        };
                    }

                    const { resizedFile, original, resized } = await resizeImage(img.file);
                    return {
                        image: URL.createObjectURL(resizedFile),
                        title: resizedFile.name,
                        file: resizedFile,
                        meta: { original, resized },
                    };
                })
            );

            const filteredResizedImages = resizedImages.filter(img => img.file != null);
            console.log("filteredResizedImages: ", filteredResizedImages);

            const urlFiles = [];
            for (const img of filteredResizedImages) {
                try {
                    const presignedResponse = await axios.get(
                        `http://54.255.151.41:8080/showcasemedia/generate-PresignedUrl`,
                        {
                            params: {
                                file_name: img.title,
                                user_name: userdetails.fullname
                            },
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`
                            }
                        }
                    );

                    const presignedUrl = presignedResponse.data.presignedURL;
                    const baseUrl = presignedUrl.split('?')[0];

                    console.log("image title: ", img.title);
                    console.log("base url: ", baseUrl);

                    urlFiles.push({
                        imageUrl: baseUrl,
                        fileName: img.title,
                    });

                    //uploade the image in S3
                    await axios.put(presignedUrl, img.file, {
                        headers: {
                            'Content-Type': img.file.type,
                            'Authorization': undefined
                        }
                    });

                    console.log(`Uploaded: ${img.title}`);
                } catch (error) {
                    console.error(`Error uploading `, error);
                    setUploadError(`Failed to upload ${img.title}`);
                    setIsUploading(false);
                    return;
                }
            }

            console.log("urlImages", urlFiles);

            const endpoint = isEditingShowcase
                ? `http://54.255.151.41:8080/showcase/edit-showcase/${editingShowcaseId}`
                : `http://54.255.151.41:8080/showcase/create-showcase`;
            const method = isEditingShowcase ? 'put' : 'post';

            axios[method](endpoint, {
                email,
                title,
                description,
                imageUrls: urlFiles,
                deletedFileIds: deletedFileIds
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json"
                }
            }).then(() => {
                fetchShowcaseData();
            });
        } else {
            console.log(isEditingShowcase ? "updating video showcase" : "submitting new video showcase");
            // TODO: Handle video editing/uploading logic
            console.log("submitting video showcase");
            console.log(selectVideo)
            const urlFiles = [];
            try{
                const presignedResponse = await axios.get(
                    `http://54.255.151.41:8080/showcasemedia/generate-PresignedUrl`,
                    {
                        params: {
                            file_name: selectVideo.name,
                            user_name: userdetails.fullname
                        },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );

                const presignedUrl = presignedResponse.data.presignedURL;
                const baseUrl = presignedUrl.split('?')[0];

                urlFiles.push({
                    imageUrl: baseUrl,
                    fileName: selectVideo.name,
                });

                try {
                    const response = await axios.put(presignedUrl, selectVideo, {
                        headers: {
                            'Content-Type': selectVideo.type,
                        },
                    });
                    console.log(response);
                } catch (error) {
                    console.error("Error uploading video:", error);
                    setUploadError('Failed to upload video. Please try again.');
                    setIsUploading(false);
                    return; // stop the rest of the logic
                }

                const endpoint = isEditingShowcase
                    ? `http://54.255.151.41:8080/showcase/edit-showcase/${editingShowcaseId}`
                    : `http://54.255.151.41:8080/showcase/create-showcase`;
                const method = isEditingShowcase ? 'put' : 'post';

                axios[method](endpoint, {
                    email,
                    title,
                    description,
                    imageUrls: urlFiles,
                    deletedFileIds: deletedFileIds,
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                        "Content-Type": "application/json"
                    }
                })

            }catch(err){

            }

        }
        setDeletedFileIds([]);
        setIsUploading(false);
        handleClose();
    };


    const handleVideoChange = (event) => {
        const file = event.target.files[0];
        const MAX_VIDEO_SIZE_MB = 500;

        if (file) {
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_VIDEO_SIZE_MB) {
                setUploadError(`Video exceeds the 500MB limit. Your file is ${fileSizeMB.toFixed(2)}MB.`);
                setSelectedVideo(null);
                event.target.value = null; // reset input
                return;
            }

            setUploadError('');
            setSelectedVideo(file);
        }
    };


    const handleImageChange = (event) => {

        setSelectedImageLenght(event.target.files.length);

        if(event.target.files.length + selectedImageLenght > MAX_IMAGE_COUNT){
            setError("Only 5 images can be uploaded")
        }

        const files = Array.from(event.target.files);
        const imagesOnly = files.filter(file => file.type.startsWith('image/'));

        const remainingSlots = MAX_IMAGE_COUNT - selectedImage.length;
        const acceptedImages = imagesOnly.slice(0, remainingSlots);
        const imageArray = acceptedImages.map((file) => ({
            title: file.name,
            image: URL.createObjectURL(file),
            file,
        }));

        setSelectedImage((prev) => [...prev, ...imageArray]);
        event.target.value = null;
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
            xs: '90%',
            sm: '70%',
            md: '50%',
            lg: '40%',
        },
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <div className="h-screen grid grid-rows-[auto_1fr]">
            <Navbar />
            <div className="grid lg:grid-cols-[1fr_3fr]">
                <div className="shadow hidden lg:block p-5">
                    <NavPanel />
                </div>
                <div className="flex flex-col direct rounded-lg gap-4 bg-gray-100 md:px-10 md:py-10">
                    <div className="flex items-center bg-white p-5 md:p-10 shadow-lg">
                        <img
                            src={userdetails.profile_image}
                            alt="Profile"
                            className="w-20 h-20 rounded-full object-cover"
                        />
                        <div className="ml-4">
                            <h2 className="text-lg font-semibold">{userdetails.fullname}</h2>
                            <p className="text-gray-500">{userdetails.service_name}</p>
                        </div>
                    </div>

                    {/* Overview Section */}
                    <div className="flex flex-col bg-white rounded-lg shadow-lg p-4 lg:p-15 gap-4">
                        <div className="flex flex-row w-full justify-between items-center md:p-4">
                            <h1 className="md:text-xl font-poppins">Overview</h1>
                        </div>
                        
                        
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                            {/* Assigned Events Card */}
                            <Box className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg">
                                <Typography variant="h6" className="font-medium mb-1">Assigned Events</Typography>
                                <Typography variant="h3" className="font-bold">{isLoadingOverview ? "..." : assignedEvents}</Typography>
                                <Typography variant="body2" className="mt-2 opacity-80">
                                    Total events you're assigned to
                                </Typography>
                            </Box>
                            
                            {/* Active Transactions Card */}
                            <Box className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white shadow-lg">
                                <Typography variant="h6" className="font-medium mb-1">Active Transactions</Typography>
                                <Typography variant="h3" className="font-bold">{isLoadingOverview ? "..." : activeTransactions}</Typography>
                                <Typography variant="body2" className="mt-2 opacity-80">
                                    Ongoing transactions
                                </Typography>
                            </Box>
                            
                            {/* Completed Transactions Card */}
                            <Box className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white shadow-lg">
                                <Typography variant="h6" className="font-medium mb-1">Completed</Typography>
                                <Typography variant="h3" className="font-bold">{isLoadingOverview ? "..." : completedTransactions}</Typography>
                                <Typography variant="body2" className="mt-2 opacity-80">
                                    Completed transactions
                                </Typography>
                            </Box>
                        </div>
                        
                        {/* Recent Activity Section */}
                        <div className="p-4">
                            <Typography variant="h6" className="font-medium mb-3">Recent Activity</Typography>
                            {isLoadingOverview ? (
                                <div className="bg-gray-50 rounded-lg p-5 text-center">
                                    <Typography variant="body1" className="text-gray-500">
                                        Loading activities...
                                    </Typography>
                                </div>
                            ) : recentActivity.length > 0 ? (
                                <div className="space-y-3">
                                    {recentActivity.map((activity, index) => (
                                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                                            <div>
                                                <Typography variant="subtitle2" className="font-medium">
                                                    {activity.eventName || `Event #${activity.transaction_Id || ''}`}
                                                </Typography>
                                                <Typography variant="body2" className="text-gray-500">
                                                    Status: {activity.transactionStatus || 'N/A'}
                                                </Typography>
                                            </div>
                                            <div className="text-right">
                                                <Typography variant="caption" className="text-gray-600">
                                                    {activity.transactionDate ? new Date(activity.transactionDate).toLocaleDateString() : 'No date'}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-lg p-5 text-center">
                                    <Typography variant="body1" className="text-gray-500">
                                        No recent activities to display
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal for adding/editing showcase items */}
            <Modal open={open} onClose={handleClose}>
                <Box
                    className="w-[90vw] max-w-3xl bg-white rounded-xl shadow-xl flex flex-col"
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    {/* Scrollable content without footer */}
                    <Box className="overflow-y-auto max-h-[70vh] p-6">
                        {/* Header */}
                        <Box className="flex items-center justify-between mb-4">
                            <Typography variant="h6" fontWeight={600}>
                                {isEditingShowcase ? 'Edit Showcase' : 'Add Showcase'}
                            </Typography>
                            <IconButton onClick={handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </Box>

                        {/* Form Fields */}
                        <Stack spacing={3}>
                            {/* Title */}
                            <Box>
                                <Typography className="text-sm font-semibold text-gray-700 mb-1">Title</Typography>
                                <TextField fullWidth value={title} onChange={(e) => setTitle(e.target.value)} />
                            </Box>

                            {/* Description (limited height) */}
                            <Box>
                                <Typography className="text-sm font-semibold text-gray-700 mb-1">Description</Typography>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    maxRows={4}
                                    inputProps={{ maxLength: 700 }}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </Box>

                            {/* Upload / Preview Section – keep unchanged */}
                            {error ? (
                                <Typography color="error" fontSize="0.9rem">{error}</Typography>
                            ) : selectVideo ? (
                                <Box className="relative border-2 border-gray-300 rounded-xl p-6 bg-gray-100 text-center">
                                    <video
                                        controls
                                        src={URL.createObjectURL(selectVideo)}
                                        className="w-full rounded-lg"
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={() => setSelectedVideo(null)}
                                        className="absolute top-2 right-2 bg-white shadow"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            ) : (
                                <Box
                                    ref={dropRef}
                                    onClick={() => document.getElementById('upload-image-button')?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                >
                                    <CloudUploadIcon className="text-gray-400 text-4xl mx-auto" />
                                    <Typography className="mt-2 text-sm">
                                        <span className="text-blue-600 underline">Click here</span> to Upload Images
                                    </Typography>
                                    <input
                                        accept="image/*"
                                        type="file"
                                        multiple
                                        onChange={handleImageChange}
                                        className="hidden"
                                        id="upload-image-button"
                                    />
                                </Box>
                            )}

                            {/* Preview Section */}
                            {selectedImage.length > 0 && (
                                <ImageList cols={3} gap={8}>
                                    {selectedImage.slice(0, 3).map((item, index) => (
                                        <ImageListItem key={index} sx={{ position: 'relative' }}>
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                style={{
                                                    borderRadius: '12px',
                                                    width: '100%',
                                                    height: 'auto',
                                                    objectFit: 'cover',
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => handleRemoveImage(index)}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 4,
                                                    right: 4,
                                                    backgroundColor: '#fff',
                                                    boxShadow: 1,
                                                }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </ImageListItem>
                                    ))}
                                    {selectedImage.length > 3 && (
                                        <ImageListItem
                                            onClick={() => setEditMediaOpen(true)}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#e0e0e0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                +{selectedImage.length - 3} more
                                            </Typography>
                                        </ImageListItem>
                                    )}
                                </ImageList>
                            )}
                        </Stack>
                    </Box>

                    {isUploading && (
                        <Typography color="primary" sx={{ px: 4, py: 1 }}>
                            Uploading... Please wait.
                        </Typography>
                    )}

                    {uploadError && (
                        <Typography color="error" sx={{ px: 4, py: 1 }}>
                            {uploadError}
                        </Typography>
                    )}

                    {/* Sticky Footer Buttons */}
                    <Box className="flex flex-col gap-2 p-4 border-t border-gray-200 rounded-b-xl bg-white">

                        {/* Uploading or error message */}
                        {uploadError && (
                            <Typography color="error">{uploadError}</Typography>
                        )}

                        {/* Buttons */}
                        <Box className="flex justify-end gap-3">
                            {/* <Button
                                variant="contained"
                                component="label"
                                disabled={isUploading || selectedImage.length !== 0}
                            >
                                Add Video
                                <input
                                    accept="video/*"
                                    type="file"
                                    onChange={handleVideoChange}
                                    className="hidden"
                                />
                            </Button>
                            <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                                (Maximum allowed video size: 500MB)
                            </Typography> */}
                            {/* <Button
                                variant="outlined"
                                onClick={() => setEditMediaOpen(true)}
                                disabled={isUploading || selectedImage.length === 0}
                            >
                                Edit All
                            </Button> */}
                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={
                                    isUploading ||
                                    !title ||
                                    !description ||
                                    (selectedImage.length === 0 && selectVideo == null)
                                }
                            >
                                {isUploading ? 'Uploading...' : isEditingShowcase ? 'Update' : 'Add'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            {/* Fullscreen Edit Modal of a Form*/}
            <Modal open={editMediaOpen} onClose={() => setEditMediaOpen(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        overflowY: 'auto',
                    }}
                >
                    <Typography variant="h6" mb={2}>Edit Uploaded Media</Typography>

                    <ImageList cols={3} gap={16}>
                        {selectedImage.map((item, index) => (
                            <ImageListItem
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: 220,
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    loading="lazy"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        display: 'block',
                                        margin: '0 auto',
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={() => handleRemoveImage(index)}
                                    sx={{
                                        position: 'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                                        zIndex: 10,
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </ImageListItem>
                        ))}
                    </ImageList>

                    <Box mt={4} display="flex" justifyContent="space-between">
                        <label htmlFor="edit-upload-image-button">
                            <Button variant="outlined" component="span">Add More Images</Button>
                            <input
                                accept="image/*"
                                type="file"
                                multiple
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                id="edit-upload-image-button"
                            />
                        </label>
                        <Button variant="contained" onClick={() => setEditMediaOpen(false)}>Done</Button>
                    </Box>
                </Box>
            </Modal>

            {/* Fullscreen Viewer Modal */}
            <Modal
                open={!!activeGallery}
                onClose={() => setActiveGallery(null)}
                sx={{
                    backdropFilter: 'blur(6px)', // 🔵 BLUR BACKGROUND
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dim + blur
                    zIndex: 1300,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90%',
                        maxWidth: '900px',
                        maxHeight: '90vh',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {activeGallery && (
                        <>
                            <img
                                src={activeGallery.images[activeGallery.index].image}
                                alt="Preview"
                                style={{
                                    maxHeight: '70vh',
                                    maxWidth: '100%',
                                    borderRadius: '12px',
                                    objectFit: 'contain',
                                    boxShadow: '0px 0px 20px rgba(0,0,0,0.5)',
                                }}
                            />
                            <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                width="100%"
                                mt={2}
                                px={2}
                            >
                                <Button
                                    sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        },
                                        color: 'white'
                                    }}
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() =>
                                        setActiveGallery((prev) => ({
                                            ...prev,
                                            index:
                                                prev.index === 0
                                                    ? prev.images.length - 1
                                                    : prev.index - 1,
                                        }))
                                    }
                                >
                                    Prev
                                </Button>
                                <Typography color="white">
                                    {activeGallery.index + 1} / {activeGallery.images.length}
                                </Typography>
                                <Button
                                    sx={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                        },
                                        color: 'white'
                                    }}
                                    variant="outlined"
                                    color="inherit"
                                    onClick={() =>
                                        setActiveGallery((prev) => ({
                                            ...prev,
                                            index:
                                                prev.index === prev.images.length - 1
                                                    ? 0
                                                    : prev.index + 1,
                                        }))
                                    }
                                >
                                    Next
                                </Button>
                            </Box>
                        </>
                    )}
                </Box>
            </Modal>

        </div>
    );
};

export default SubcontractorDashboard;