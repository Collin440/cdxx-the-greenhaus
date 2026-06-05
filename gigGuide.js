let gigs = JSON.parse(
    localStorage.getItem("cdxxGigs")
) || [];

const gigList =
    document.querySelector(".gig-list");

const postGigBtn =
    document.querySelector("#post-gig-btn");

const gigMediaInput =
    document.querySelector("#gig-media");

let uploadedGigMedia = "";
let mediaType = "image";

/* =========================================
   MEDIA UPLOAD
========================================= */

gigMediaInput.addEventListener("change", () => {

    const file = gigMediaInput.files[0];

    if (!file) return;

    mediaType = file.type.startsWith("video")
        ? "video"
        : "image";

    const reader = new FileReader();

    reader.onload = (event) => {

        uploadedGigMedia = event.target.result;

    };

    reader.readAsDataURL(file);

});

/* =========================================
   RENDER GIGS
========================================= */

function renderGigs() {

    gigList.innerHTML = "";

    gigs.forEach((gig) => {

        gigList.innerHTML += `

            <div class="gig-card">

                ${
                    gig.type === "video"

                    ?

                    `

                    <video
                        class="gig-video"
                        src="${gig.media}"
                        controls
                        muted
                        loop
                    ></video>

                    `

                    :

                    `

                    <img
                        src="${gig.media}"
                        class="gig-image"
                    >

                    `
                }

                <div class="gig-info">

                    <h4>${gig.title}</h4>

                    <p>${gig.venue}</p>

                    <span>${gig.date}</span>

                    <a
                        href="${gig.link}"
                        target="_blank"
                        class="ticket-btn"
                    >
                        Get Tickets
                    </a>

                </div>

            </div>

        `;

    });

}

/* =========================================
   CREATE GIG
========================================= */

postGigBtn.addEventListener("click", () => {

    const title =
        document.querySelector("#gig-title").value;

    const venue =
        document.querySelector("#gig-venue").value;

    const date =
        document.querySelector("#gig-date").value;

    const link =
        document.querySelector("#gig-link").value;

    if (
        !title ||
        !venue ||
        !date ||
        !uploadedGigMedia
    ) {
        alert("Please complete the gig form.");
        return;
    }

    const newGig = {

        title,
        venue,
        date,
        link,
        media: uploadedGigMedia,
        type: mediaType

    };

    gigs.unshift(newGig);

    localStorage.setItem(
        "cdxxGigs",
        JSON.stringify(gigs)
    );

    renderGigs();

    /* CLEAR FORM */

    document.querySelector("#gig-title").value = "";
    document.querySelector("#gig-venue").value = "";
    document.querySelector("#gig-date").value = "";
    document.querySelector("#gig-link").value = "";

    gigMediaInput.value = "";

    uploadedGigMedia = "";

});

/* =========================================
   INITIAL RENDER
========================================= */

renderGigs();