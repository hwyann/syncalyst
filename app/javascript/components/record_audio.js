var recordButton, stopButton, recorder;

const blobToFile = (theBlob, fileName) => {
      //A Blob() is almost a File() - it's just missing the two properties below which we will add
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileName;
      return theBlob;
}

const onRecordingReady = (item, e) => {
  // let audio = document.getElementById('audio');
  // audio.src = URL.createObjectURL(e.data);
  console.log('data is ready!');
  // console.log(e.data);
  const result = blobToFile(e.data,'audio.mp4');
  const form = item.querySelector('.edit_agenda');
  console.log(form);
  const formData = new FormData(form);
    formData.set('agenda[audio]', result, 'helloworld.wav');

    var request = new XMLHttpRequest();
    request.open("PATCH", form.action);
    request.send(formData);

    request.onload = (res) => {
      console.log(res);
    };
}

const startRecording = () => {
  console.log('clicked start!');
  recordButton.disabled = true;
  // stopButton.disabled = false;

  recorder.start();
}

const stopRecording = () => {
  console.log('clicked stop');
  recordButton.disabled = false;
  stopButton.disabled = true;
  // Stopping the recorder will eventually trigger the `dataavailable` event and we can complete the recording process
  recorder.stop();
}


const recordAudio = () => {
      const li = document.querySelectorAll('.agenda-cards-inprogress');
      li.forEach((item) => {
        // console.log(item);

        recordButton = item.querySelector('.record');
          recordButton.addEventListener('click', (event) => {
            navigator.mediaDevices.getUserMedia({
            audio: true
          })
            .then(function (stream) {
              recordButton.disabled = false;
              recorder = new MediaRecorder(stream);
              startRecording();
              stopButton = item.querySelector('.stop');
              console.log(stopButton);

              // recordButton.addEventListener('click', startRecording);
              stopButton.addEventListener('click', stopRecording);
              console.log(recorder);

              // listen to dataavailable, which gets triggered whenever we have
              // an audio blob available
              // console.log(item);
              recorder.addEventListener('dataavailable', (event) => {
                onRecordingReady(item, event);
            });
          });

              });
          // console.log(stopButton);

          // get audio stream from user's mic



      })

  };



export { recordAudio }
