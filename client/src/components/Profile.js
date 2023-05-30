import React, {useEffect} from 'react';
import './Profile.css'
import useEth from '../contexts/EthContext/useEth';
import {useState} from 'react';
import {useRef} from 'react';
import {transferData, criminalTransfer, distanceTransfer, findCrimeResponse} from "../api/transfer";
import * as canvas from 'canvas';
import * as faceapi from 'face-api.js';
import {Await} from "react-router-dom";

const {Canvas, Image, ImageData} = canvas;
faceapi.env.monkeyPatch({
    Canvas: HTMLCanvasElement,
    Image: HTMLImageElement,
    ImageData: ImageData,
    Video: HTMLVideoElement,
    createCanvasElement: () => document.createElement('canvas'),
    createImageElement: () => document.createElement('img')
})


function Profile() {
    const [yournumber, numset] = useState("");
    const {state: {contract, accounts, web3}} = useEth();
    const [inputs, setInputs] = useState({number: ''});
    const {number} = inputs;

    const videoRef = useRef();
    const videoHeight = 1050;
    const videoWidth = 1400;
    const canvasRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [captureVideo, setCaptureVideo] = useState(false);

    let input = document.getElementById('myImg')


    // const CustomloadImage = async () => {
    //   // 업로드 된 이미지 이름을 배열에 담아 라벨링 합니다.
    //   const labels = ["1","2","3","4","5","6","7","8","9","10"];

    //   return Promise.all(
    //     labels.map(async (label) => {
    //       const descriptions = [];
    //         const result = await contract.methods.getCriminal(3).call();
    //         const attributes=result[5]
    //         let jsonatt=JSON.parse(attributes)
    //         let crimedescriptors=jsonatt.descriptors[0]
    //         let newarray=new Float32Array(crimedescriptors)
    //       descriptions.push(newarray);


    //       return new faceapi.LabeledFaceDescriptors(label, descriptions);
    //     })
    //   );
    // };


    const CustomloadImage2 = async () => {
        // 업로드 된 이미지 이름을 배열에 담아 라벨링 합니다.
        const labels = ["0", "1", "2", "3"];
        const max = await contract.methods.totalSupply().call();
        let CriminalList = []
        let DiscriptorList = []
        let labeled = []

        for (let i = 0; i < max; i++) {
            const info = await contract.methods.getCriminal(i).call();
            CriminalList.push(info)
            labeled.push(i.toString);
            let att = JSON.parse(CriminalList[i][5])
            let newarray = new Float32Array(att.descriptors[0])
            DiscriptorList.push(newarray);

        }


        return Promise.all(
            labels.map(async (label) => {
                let descriptions = [];
                // const result = await contract.methods.getCriminal(3).call();
                // const attributes=result[5]
                // let jsonatt=JSON.parse(attributes)
                // let crimedescriptors=jsonatt.descriptors[0]
                // let newarray=new Float32Array(crimedescriptors)
                // descriptions.push(newarray);
                let n = parseInt(label)
                descriptions.push(DiscriptorList[n])


                return new faceapi.LabeledFaceDescriptors(label, descriptions);
            })
        );
    };

    useEffect(() => {
        const loadModels = async () => {

            Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/ssd_mobilenetv1_model-weights_manifest.json'),
                faceapi.nets.faceLandmark68Net.loadFromUri('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_landmark_68_model-weights_manifest.json'),
                faceapi.nets.faceLandmark68TinyNet.loadFromUri('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_landmark_68_tiny_model-weights_manifest.json'),
                faceapi.nets.faceRecognitionNet.loadFromUri('https://raw.githubusercontent.com/ml5js/ml5-data-and-models/main/models/faceapi/face_recognition_model-weights_manifest.json')

            ]).then(setModelsLoaded(true));
        }
        loadModels();
    }, []);

    const startVideo = () => {
        setCaptureVideo(true);
        navigator.mediaDevices
            .getUserMedia({video: {width: 300}})
            .then(stream => {
                let video = videoRef.current;
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error("error:", err);
            });
    }

    const handleVideoOnPlay = () => {
        const boxColor = 'red'; // 원하는 색상을 지정합니다.

        setInterval(async () => {
            if (canvasRef && canvasRef.current) {
                canvasRef.current.innerHTML = faceapi.createCanvasFromMedia(videoRef.current);
                const displaySize = {
                    width: videoWidth,
                    height: videoHeight
                }


                faceapi.matchDimensions(canvasRef.current, displaySize);
                const detections = await faceapi.detectAllFaces(videoRef.current).withFaceLandmarks();
                const detected = await faceapi.detectAllFaces(videoRef.current).withFaceLandmarks().withFaceDescriptors();
                const resizedDetections = faceapi.resizeResults(detections, displaySize);
                const resizedDetected = faceapi.resizeResults(detected, displaySize);
                //감지된 얼굴들 담은 변수

                // const labeledFaceDescriptors = await loadImage();
                // console.log(labeledFaceDescriptors)
                // transferData(resizedDetected[0].descriptor)
                const labeledFaceDescriptors = await CustomloadImage2();
                const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
                canvasRef && canvasRef.current && canvasRef.current.getContext('2d').clearRect(0, 0, videoWidth, videoHeight);
                canvasRef && canvasRef.current && faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

                // for(let i=0; i<resizedDetected.length; i++)
                // {
                //   if(resizedDetected[i])
                //   {
                //     // transferData(resizedDetected[i].descriptor)
                // let similarity = faceMatcher.findBestMatch(resizedDetected[i].descriptor).toString();
                //     console.log(similarity)

                //     if(parseInt(similarity)<0.4)
                //     {
                //       resizedDetections.forEach(detection => {
                //       const {x,y,width,height}=detection.detection.box;
                //       canvasRef.current.getContext('2d').strokeStyle = boxColor;
                //       canvasRef.current.getContext('2d').strokeRect(x, y, width, height);
                //       });
                //     }
                //   }

                // }

                // let distance = transferData(resizedDetected[0].descriptor);
                // console.log(typeof distance);
                // console.log(distance);

                resizedDetected.forEach(detection => {
                    const {x, y, width, height} = detection.detection.box;
                    // let distance = faceMatcher.findBestMatch(detection.descriptor).distance;


                    // 위에 있는거 가져온 코드
                    for (let i = 0; i < resizedDetected.length; i++) {
                        if (resizedDetected[i]) {
                            // transferData(resizedDetected[i].descriptor)
                            // let distance;



                            transferData(resizedDetected[i].descriptor).then((data) => {
                                console.log(data);
                                if (parseInt(data) < 0.4) {
                                    findCrimeResponse().then((findCrime)=>{
                                        // findCrime 내부에 범죄자 정보가 다 있음
                                        console.log(findCrime);
                                        // 꺼내서 사용할 때는 .name .country .age .flag .criminal .num으로 아래와 같이 사용하면 됨.
                                        console.log(findCrime.name);
                                    });

                                    resizedDetections.forEach(detection => {
                                        const {x, y, width, height} = detection.detection.box;
                                        canvasRef.current.getContext('2d').strokeStyle = boxColor;
                                        canvasRef.current.getContext('2d').strokeRect(x, y, width, height);
                                    });
                                }
                            })

                            /*if (parseInt(distance) < 0.4) {
                                resizedDetections.forEach(detection => {
                                    const {x, y, width, height} = detection.detection.box;
                                    canvasRef.current.getContext('2d').strokeStyle = boxColor;
                                    canvasRef.current.getContext('2d').strokeRect(x, y, width, height);
                                });
                            }*/
                        }

                    }

                    // if (parseInt(distance) < 0.4) {
                    //
                    //     canvasRef.current.getContext('2d').strokeStyle = boxColor;
                    //     canvasRef.current.getContext('2d').strokeRect(x, y, width, height);
                    // } else {
                    //
                    //     canvasRef && canvasRef.current && faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
                    //
                    // }
                });


                // canvasRef && canvasRef.current && faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
            }
        }, 1000)
    }

    const closeWebcam = () => {
        videoRef.current.pause();
        videoRef.current.srcObject.getTracks()[0].stop();
        setCaptureVideo(false);
    }

    useEffect(() => {

        console.log(yournumber)
    }, []);


    function authentifier() {

        return (
            <div className='Profile'>


                <div className='Authentication'>

                    {
                        captureVideo ?
                            modelsLoaded ?
                                <div>
                                    <div style={{display: 'flex', justifyContent: 'center', padding: '10px'}}>
                                        <video ref={videoRef} height={videoHeight} width={videoWidth}
                                               onPlay={handleVideoOnPlay} style={{borderRadius: '10px'}}/>
                                        <canvas ref={canvasRef}
                                                style={{position: 'absolute', border: '1px solid red'}}/>
                                    </div>
                                </div>
                                :
                                <div>loading...</div>
                            :
                            <>
                            </>
                    }

                    <div style={{textAlign: 'center', padding: '10px'}}>
                        {
                            captureVideo && modelsLoaded ?
                                <button onClick={closeWebcam} style={{
                                    cursor: 'pointer',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    padding: '15px',
                                    fontSize: '25px',
                                    border: 'none',
                                    borderRadius: '10px'
                                }}>
                                    Close Webcam
                                </button>
                                :
                                <button onClick={startVideo} style={{
                                    cursor: 'pointer',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    padding: '15px',
                                    fontSize: '25px',
                                    border: 'none',
                                    borderRadius: '10px'
                                }}>
                                    Open Webcam
                                </button>
                        }
                    </div>


                </div>


            </div>


        )
    }


    return (


        <React.Fragment>


            {authentifier()}


        </React.Fragment>


    );
}


export default Profile;
