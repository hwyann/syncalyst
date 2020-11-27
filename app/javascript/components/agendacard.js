import { recordAudio } from './record_audio.js';
import { initNav } from './speech-navigation.js';
import Rails from '@rails/ujs'

let taskspeech

const stop = document.querySelector('.stop');
const stopRecordingBtn = document.querySelector('.stopRecording');
const recordBtn = document.querySelector('.record');
const soundClips = document.querySelector('.sound-clips');
const agendaItems = document.querySelectorAll(".progress-step");

function fadeOutEffect(element) {
    var fadeTarget = element;
    var fadeEffect = setInterval(function() {
        if (!fadeTarget.style.opacity) {
            fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity > 0) {
            fadeTarget.style.opacity -= 0.04;
        } else {
            clearInterval(fadeEffect);
        }
    }, 200);
}



const transcription = (index) => {
    const transcriptionItems = document.querySelectorAll(".transcription");
    transcriptionItems.forEach((transcription) => {
        transcription.innerHTML = "";
    });

    transcriptionItems[index].insertAdjacentHTML("beforeend", "<div class='form-group' id='content-form'><textarea class='form-control hide' id='textbox' rows='10'></textarea></div><div class='form-group'><button type='button' id='stop-btn' class='btn btn-primary btn-block'>Stop Recording</button><p id='instructions'>Press start to record</p></div>")
};

const initSpeech = (i) => {
    var speechRecognition = window.webkitSpeechRecognition;
    let recognition = new speechRecognition();
    var textbox = $("#textbox");
    let instructions = $("#instructions");
    let content = '';

    recognition.continuous = true;

    recognition.onstart = function() {
        instructions.text("Voice Recognition is on");
    }

    recognition.onspeechend = function() {
        instructions.text("No Activity");
        console.log("finished")
    }

    recognition.onerror = function() {
        instructions.text("Try again");
    }



    recognition.onresult = function(event) {
        var current = event.resultIndex;
        var transcript = event.results[current][0].transcript;
        content += transcript;
        if (transcript.includes("stop")) {

            document.querySelector("#stop-btn").click();
            const recordForm = document.querySelector('.currentagendaitem');
            recordForm.insertAdjacentHTML('afterBegin', "<p class='voice-alert'><i class='fas fa-stop-circle mr-1'></i>Recording has stopped.</p>");
            const voiceAlert = document.querySelector('.voice-alert');
            fadeOutEffect(voiceAlert);
            setTimeout(function() {
                voiceAlert.remove();
            }, 6000);

        } else if (transcript.includes("show transcript")) {
            document.querySelector("#textbox").classList.remove("hide");
        } else if (transcript.includes("hide transcript")) {
            document.querySelector("#textbox").classList.add("hide");

        } else if (transcript.includes("order coffee")) {
          const recordForm = document.querySelector('.currentagendaitem');
            recordForm.insertAdjacentHTML('afterBegin', "<p class='voice-alert'><i class='fas fa-coffee'></i>Intern is fetching coffee</p>");
            const voiceAlert = document.querySelector('.voice-alert');
            fadeOutEffect(voiceAlert);
            setTimeout(function() {
                voiceAlert.remove();
            }, 6000);
        } else if (transcript.includes("I don't like you")) {
          const recordForm = document.querySelector('.currentagendaitem');
            recordForm.insertAdjacentHTML('afterBegin', "<p class='voice-alert'><i class='fas fa-hand-middle-finger'></i>Fuck you Yann</p>");
            const voiceAlert = document.querySelector('.voice-alert');
            fadeOutEffect(voiceAlert);
            setTimeout(function() {
                voiceAlert.remove();
            }, 6000);
        } else if (transcript.includes("can you")) {
          const recordForm = document.querySelector('.currentagendaitem');
            recordForm.insertAdjacentHTML('afterBegin', "<p class='voice-alert'><i class='fas fa-clipboard-check'></i>Task ready!! Click to assign</p>");
            const voiceAlert = document.querySelector('.voice-alert');
            fadeOutEffect(voiceAlert);
            setTimeout(function() {
                voiceAlert.remove();
            }, 6000);
          taskspeech = transcript;

        } else {
            textbox.val(content);
        }
    }



    if (content.length) {
        content += '';
    }
    recognition.start();

    $("#stop-btn").click(function(event) {
        event.preventDefault();
        recognition.stop();
        const record = document.querySelector("#record");
        record.classList.add("record-hidden");
        console.log(content);
        stopRecordingBtn.click();
        // send content to rails:
        const contentForm = document.querySelector("#content-form")
        const agendaId = contentForm.parentElement.dataset.agenda
        $.ajax({
            url: `/agendas/${agendaId}`,
            data: { "transcription": content },
            type: "PATCH",
            success: function(data) {
                console.log(data);
            }
        });
        // reset content
        content = '';
        // reset Navigation Bot
        initNav();
    })

    textbox.on('input', function() {
        content = $(this).val();
    })
}

const initAgenda = () => {
    let i = 1;
    //calls audio recording function
    recordAudio();
      const people = document.querySelectorAll('.task-owner');
          people.forEach((person) => {
            person.addEventListener('click', (event) => {
              const form = person.querySelector('form');
              console.log(form);
              const input = person.querySelector('.task_description').firstChild;
              taskspeech = taskspeech.substring(taskspeech.indexOf('you') + 4);
              input.value = taskspeech;
              input.focus();
              form.submit();
              Rails.fire(form,'submit');
              // form.reset();
              const recordForm = document.querySelector('.currentagendaitem');
              recordForm.innerHTML = "";
              recordForm.insertAdjacentHTML('afterBegin', `<p class='voice-alert'><i class='fas fa-clipboard-check'></i>Task: ${taskspeech} Assigned!</p>`);
              const voiceAlert = document.querySelector('.voice-alert');
              fadeOutEffect(voiceAlert);
              setTimeout(function() {
                voiceAlert.remove();
            }, 6000);
            });
          });
    if (agendaItems) {
        agendaItems.forEach((item) => {

            item.addEventListener('click', (event) => {
                // to style the current agenda topic:
                const active = document.querySelector('.is-active')
                if (active) {
                  active.classList.remove('is-active');
                }
                item.classList.add('is-active');
                // end
                recordBtn.click();

                event.preventDefault();
                const record = document.querySelector("#record");
                record.classList.remove("record-hidden");
                record.classList.add("blink");
                const activity = document.querySelector("#activity");
                activity.classList.add("record-hidden");
                agendaItems.forEach((card) => {
                    if (card.classList.contains("active")) {
                        card.classList.remove("active");
                    }
                });
                event.currentTarget.classList.add("active");
                const array = Array.from(agendaItems);
                const index = array.indexOf(event.currentTarget);
                transcription(index);
                initSpeech(i);
                const finish = document.querySelector(`#agenda${i}`)
                i += 1;
            });
        });
    }
}

export { initAgenda, fadeOutEffect }
