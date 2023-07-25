Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/",
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false
    });

    dz.on("addedfile", function () {
        if (dz.files[1] != null) {
            dz.removeFile(dz.files[0]);
        }
    });
    dz.on("complete", function (file) {
        let imageData = file.dataURL;

        var url = "http://127.0.0.1:5000/classify_image";

        $.post(url, {
            image_data: file.dataURL
        }, function (data, status) {
            /* 
            Below is a sample response if you have two faces in an image lets say virat and roger together.
            Most of the time if there is one person in the image you will get only one element in below array
            data = [
                {
                    class: "viral_kohli",
                    class_probability: [1.05, 12.67, 22.00, 4.5, 91.56],
                    class_dictionary: {
                        lionel_messi: 0,
                        maria_sharapova: 1,
                        roger_federer: 2,
                        serena_williams: 3,
                        virat_kohli: 4
                    }
                },
                {
                    class: "roder_federer",
                    class_probability: [7.02, 23.7, 52.00, 6.1, 1.62],
                    class_dictionary: {
                        lionel_messi: 0,
                        maria_sharapova: 1,
                        roger_federer: 2,
                        serena_williams: 3,
                        virat_kohli: 4
                    }
                }
            ]
            */
            // console.log(data);
            // if (!data || data.length==0) {
            //     $("#resultHolder").hide();
            //     $("#divClassTable").hide();                
            //     $("#error").show();
            //     return;
            // }
            console.log(data);
            if (!data || data.length == 0) {
                $("#resultHolder").hide()
                $("#divClassTable").hide()
                $("#error").show();
                return;
            }
            let players = ["lionel_messi", "maria_sharapova", "roger_federer", "serena_williams", "virat_kohli"];
            let matches = []; // Array to store multiple matches
            let bestScore = -1;

            for (let i = 0; i < data.length; i++) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    matches = [data[i]]; // Reset the matches array with the new match
                    bestScore = maxScoreForThisClass;
                } else if (maxScoreForThisClass === bestScore) {
                    matches.push(data[i]); // Add the player to matches if they have the same best score
                }
            }
            console.log(matches.length)

            if (matches.length > 0) {
                $("#error").hide();
                $("#resultHolder").show();
                $("#divClassTable").show();

                // Assuming you want to display only the first match in the HTML resultHolder
                $("#resultHolder").html($(`[data-player="${matches[0].class}"`).html());

                for (let match of matches) {
                    let classDictionary = match.class_dictionary;
                    for (let personName in classDictionary) {
                        let index = classDictionary[personName];
                        let proabilityScore = match.class_probability[index];
                        let elementName = "#score_" + personName;
                        $(elementName).html(proabilityScore);
                    }
                
                }
            }

            // // let players = ["lionel_messi", "maria_sharapova", "roger_federer", "serena_williams", "virat_kohli"];
            // // let matches = []; // Array to store multiple matches
            // // let bestScore = -1;

            // // for (let i = 0; i < data.length; i++) {
            // //     let maxScoreForThisClass = Math.max(...data[i].class_probability);
            // //     if (maxScoreForThisClass > bestScore) {
            // //         matches = [data[i]]; // Reset the matches array with the new match
            // //         bestScore = maxScoreForThisClass;
            // //     } else if (maxScoreForThisClass === bestScore) {
            // //         matches.push(data[i]); // Add the player to matches if they have the same best score
            // //     }
            // // }

            // // if (matches.length > 0) {
            // //     $("#error").hide();
            // //     $("#resultHolder").show();
            // //     $("#divClassTable").show();

            // //     // Clear the previous content in resultHolder
            // //     $("#resultHolder").html("");

            // //     for (let match of matches) {
            // //         let classDictionary = match.class_dictionary;
            // //         let resultHtml = `<div data-player="${match.class}">${$(`[data-player="${match.class}"]`).html()}</div>`;
            // //         for (let personName in classDictionary) {
            // //             let index = classDictionary[personName];
            // //             let proabilityScore = match.class_probability[index];
            // //             let elementName = "#score_" + personName;
            // //             resultHtml += `<p>${personName}: ${proabilityScore}</p>`;
            // //         }
            // //         $("#resultHolder").append(resultHtml);
            // //     }
            // // }

    



            //dz.removeFile(file);            
        });
    });

    $("#submitBtn").on('click', function (e) {
        dz.processQueue();
    });
}

$(document).ready(function () {
    console.log("ready!");
    $("#error").hide();
    $("#resultHolder").hide();
    $("#divClassTable").hide();

    init();
});