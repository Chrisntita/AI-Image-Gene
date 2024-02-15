// Selecting the elements from the DOM
const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");


//you need to create your own api key because this one will expire
// Defining OpenAI API key and a flag to track image generation status
const OPENAI_API_KEY = "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";
let isImageGenerating = false;

// Function to update the image cards in the gallery with generated images
const updateImageCard = (imgDataArray) => {
    imgDataArray.forEach((imgObject, index) => {
        const imgCard = imageGallery.querySelectorAll(".img-card")[index];
        const imgElement = imgCard.querySelector("img");
        const downloadBtn = imgCard.querySelector(".download-btn");

        // Constructing the base64 image URL and updating the image element
        const aiGeneratedImg = `data:image/jpeg;base64,${imgObject.b64_json}`;
        imgElement.src = aiGeneratedImg;

        // Handling image loading event
        imgElement.onload = () => {
            imgCard.classList.remove("loading");
            downloadBtn.setAttribute("href", aiGeneratedImg);
            downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
        };
    });
};

// Function to generate AI images using OpenAI API
const generateAiImages = async (userPrompt, userImgQuantity) => {
    try {
        // Fetching image generation data from OpenAI API
        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({ 
                prompt: userPrompt,
                n: parseInt(userImgQuantity),
                size: "512x512",
                response_format: "b64_json"
            })
        });

        // Handling non-successful response
        if (!response.ok) throw new Error("Failed to generate images! please try again later");
         
        const {data} = await response.json();
        // Updating the image cards in the gallery with generated images
        updateImageCard([...data]);
    } catch (error) {
        // Alerting the user in case of an error
        alert(error.message);
    } finally {
        // Resetting the image generation status flag
        isImageGenerating = false;
    }
};

// Function to handle form submission
const handleFormSubmission = async (e) => {
    e.preventDefault();
    // If image generation is already in progress, do nothing
    if (isImageGenerating) return;
    // Setting the flag to indicate image generation is in progress
    isImageGenerating = true;

    // Retrieving user input values
    const userPrompt = e.target[0].value;
    const userImgQuantity = e.target[1].value;

    // Creating markup for image cards based on user input quantity
    const imgCardMakeup = Array.from({ length: userImgQuantity }, () =>
        `<div class="img-card loading">
            <img src="images/loader.svg" alt="image">
            <a href="#" class="download-btn">
                <img src="images/download.svg" alt="download icon">
            </a>
        </div>`
    ).join("");

    // Setting up initial loading state in the image gallery
    imageGallery.innerHTML = imgCardMakeup;

    // Generating AI images and updating the gallery
    const images = await generateAiImages(userPrompt, userImgQuantity);
    updateImageGallery(images);
};

// Function to update the image gallery with generated images
const updateImageGallery = (images) => {
    const imgCards = document.querySelectorAll(".img-card");
    images.forEach((image, index) => {
        const imgElement = imgCards[index].querySelector("img");
        imgElement.src = "data:image/png;base64," + image;
        imgCards[index].classList.remove("loading");
    });
};

// Event listener for form submission
generateForm.addEventListener("submit", handleFormSubmission);
