const slider =
    document.getElementById("cushionSlider");

const liveValue =
    document.getElementById("liveCushionValue");

const cushionValue =
    document.getElementById("cushionValue");

const cushionFill =
    document.getElementById("cushionFill");

const platePosition =
    document.getElementById("platePosition");

const comfortValue =
    document.getElementById("comfortValue");

const responseValue =
    document.getElementById("responseValue");


const archValue =
    document.getElementById("archValue");

const archFill =
    document.getElementById("archFill");

const fitTitle =
    document.getElementById("fitTitle");

const fitDescription =
    document.getElementById("fitDescription");

const modeNumber =
    document.getElementById("modeNumber");

const activityLabel =
    document.getElementById("activityLabel");


const modeButtons =
    document.querySelectorAll(".mode");



/* -------------------------
   MODE PRESETS
-------------------------- */

const presets = {

    walk: {

        title:
            "Everyday Comfort",

        description:
            "Softer cushioning for comfortable everyday movement.",

        cushion:
            45,

        arch:
            60,

        modeNumber:
            "01"

    },


    run: {

        title:
            "Responsive Run",

        description:
            "Balanced cushioning for smoother transitions and energy return.",

        cushion:
            62,

        arch:
            70,

        modeNumber:
            "02"

    },


    basketball: {

        title:
            "Court Response",

        description:
            "Firmer cushioning for faster response, stability and court movement.",

        cushion:
            82,

        arch:
            78,

        modeNumber:
            "03"

    }

};



/* -------------------------
   UPDATE CUSHIONING
-------------------------- */

function updateCushion(value) {

    value =
        Number(value);


    /* number */

    liveValue.textContent =
        value;

    cushionValue.textContent =
        value;


    /* card progress */

    cushionFill.style.width =
        value + "%";


    /* carbon plate position */

    platePosition.style.left =
        value + "%";


    /*
    Soft = comfort high
    Firm = response high
    */

    const comfort =
        Math.round(
            100 - value * 0.62
        );


    const response =
        Math.round(
            25 + value * 0.75
        );


    comfortValue.textContent =
        comfort;

    responseValue.textContent =
        response;


    /* slider fill */

    slider.style.background = `

        linear-gradient(
            to right,

            var(--shoe-pink)
            0%,

            var(--shoe-pink)
            ${value}%,

            rgba(255,255,255,.14)
            ${value}%,

            rgba(255,255,255,.14)
            100%
        )

    `;

}



/* slider interaction */

slider.addEventListener(
    "input",

    function () {

        updateCushion(
            slider.value
        );

    }
);



/* -------------------------
   ACTIVITY MODES
-------------------------- */

modeButtons.forEach(button => {

    button.addEventListener(
        "click",

        function () {

            /* remove old active */

            modeButtons.forEach(btn => {

                btn.classList.remove(
                    "active"
                );

            });


            /* active selected */

            button.classList.add(
                "active"
            );


            const mode =
                button.dataset.mode;


            const preset =
                presets[mode];


            /* text */

            fitTitle.textContent =
                preset.title;


            fitDescription.textContent =
                preset.description;


            modeNumber.textContent =
                preset.modeNumber;


            activityLabel.textContent =
                mode.toUpperCase();


            /* Arch */

            archValue.textContent =
                preset.arch;


            archFill.style.width =
                preset.arch + "%";


            /* Cushion */

            slider.value =
                preset.cushion;


            updateCushion(
                preset.cushion
            );

        }

    );

});



/* initial state */

updateCushion(
    slider.value
);
