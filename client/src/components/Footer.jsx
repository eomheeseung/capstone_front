import { useState,useCallback,useEffect } from 'react'
import { create } from 'ipfs-http-client'
import React from 'react';
import "./Footer.css"
import useEth from "../contexts/EthContext/useEth";
import { Buffer } from 'buffer';
import {transferData, criminalTransfer} from "../api/transfer";

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from "@web3modal/ethereum";


import { Web3Button } from "@web3modal/react";
import { Web3Modal } from "@web3modal/react";

import { configureChains, createConfig, WagmiConfig } from "wagmi";

import { sepolia } from "wagmi/chains";
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({
  Canvas:HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
  })

const projectId = '2L2d01In1I9OFbre81IirWt0szw';
const projectSecret = '7c43815b40bc5ae32c34ad9d6db87dad';
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
let input=''


function Footer() {  
  const [fileUrl, updateFileUrl] = useState("");
  const{state: {contract,accounts,web3}} = useEth();
  const[yournumber,numset]=useState("");
  const[inputs, setInputs]=useState({selectaddr:'',cname:'',nationality:'',crime:'',amount:'',age:''});
  const {selectaddr,cname,nationality,age,crime,amount}  =inputs;
  const inputss = document.getElementById('myImg')
  const chains =[sepolia];
  
  
  
  const {publicClient} = configureChains(chains,[w3mProvider({ projectId:'ad51cb658b57c4bb5916b92e7f4a4ff7'})]);
    
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({
  
      projectId:'ad51cb658b57c4bb5916b92e7f4a4ff7',
      version: "1", 
  
    chains,
    
  }),
  publicClient,
  });

  

  
  const ethereumClient = new EthereumClient(wagmiConfig,chains);
  

useEffect(() => {
  
 input= document.getElementById('myImg')

  console.log(yournumber)
  
}, []);

async function onChange(e)
{
  const {value,name} =e.target
    setInputs({
      ...inputs, // 기존의 input 객체를 복사한 뒤
      [name]: value // name 키를 가진 값을 value 로 설정
    });
}


const loadImage = async () => {
  // 업로드 된 이미지 이름을 배열에 담아 라벨링 합니다.
  const labels = ["you"];


  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      const detections = await faceapi
        .detectSingleFace(input)
        .withFaceLandmarks()
        .withFaceDescriptor();
      descriptions.push(detections.descriptor);


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

    ])
  }
  loadModels();
}, []);

const [imageSrc, setImageSrc]= useState(null);


const onUpload = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise((resolve) => { 
      reader.onload = () => {  
          setImageSrc(reader.result || null); // 파일의 컨텐츠
          resolve();

      }; 

  });

}


//여기에 솔리디티 접근제어 메소드 및 버튼 추가해서 반영할것
//요청서 형식으로 ui변경해서 반영

async function discriptorFromImage(e)
{
  try {
  const labeledFaceDescriptors =await  loadImage();
  const descriptor=JSON.stringify(labeledFaceDescriptors[0])

  //여기서 processrequest 파라미터는 입력탭 만들어서 받아야한다.
  const processRequest = await contract.methods.processRequest(cname,nationality,age,crime,amount,descriptor).send({from:accounts[0]});
  const requstid=processRequest.events.RequestReceived.returnValues[0]
  const issueRedNotice = await contract.methods.issueRedNotice(requstid).send({from:accounts[0]});
  console.log(issueRedNotice)
} 
catch (error) {  
  console.log(error)
}
}

async function getCriminal()
{
  try {
    let CriminalList=[]
    const max= await contract.methods.totalSupply().call();
    for(let i=0; i<max; i++)
    {
      const info = await contract.methods.getCriminal(i).call();
      CriminalList.push(info)
     
    }

    console.log(CriminalList)
    criminalTransfer(CriminalList)

} 
catch (error) {  
  console.log(error)
}
}

async function addAllowedUser()
{
  try {
    const result = await contract.methods.addAllowedUser(selectaddr).send({from:accounts[0]});
    console.log(result)
} 
catch (error) {  
  console.log(error)
}
}





  return (

<WagmiConfig config={wagmiConfig} >      
  <div className='Deploys' >
      


<div className='Procedure'>
      
      <div className='container'>
    <div className='CrimeDetail' style={{display:'inline-block'}}>
      <h1>Deploy Face Descriptors</h1>
      <div style={{display:'inline-block' ,height:'200px',fontSize:'15px'}} >

      <div style={{width:'210px',height:'30px'}}>
        <label style={{float:'left'}}>Name</label>
      <input name="cname" onChange={onChange} value={cname} style={{width:'150px',height:'30px',float:'right'}} />
      </div>

      <div style={{width:'210px',height:'30px'}}>
      <label style={{float:'left'}}>Nation</label>

       <input name="nationality" onChange={onChange} value={nationality} style={{width:'150px',height:'30px',float:'right'}}/>
      </div>

      <div style={{width:'210px',height:'30px'}}>
      <label style={{float:'left'}}>Age</label>

       <input name="age" onChange={onChange} value={age} style={{width:'150px',height:'30px',float:'right'}}/>
      </div>

      <div style={{width:'210px',height:'30px'}}>
      <label style={{float:'left'}}>Crime</label>

       <input name="crime" onChange={onChange} value={crime} style={{width:'150px',height:'30px',float:'right'}}/>
      </div>

      <div style={{width:'210px',height:'30px',marginBottom:'30px'}}>
      <label style={{float:'left'}}>Asset</label>

      <input name="amount" onChange={onChange} value={amount} style={{width:'150px',height:'30px',float:'right'}}/>
      </div>
      <br></br>


      </div >       
      
      <div style={{display:'inline-block' , width:'200px',marginLeft:'90px',marginTop:'30px',height:'200px'}}>
      <img id="myImg"
          width={'150px'} height={'150px'} 
          src={imageSrc} 
          style={{float:'left',background:'white', border:'2px solid black'}}
      />
       <input 
          accept="image/*" 
          multiple type="file"
          onChange={e => onUpload(e)}
          style={{width:'180px',float:'left'}}
      />
      <label className='custom-btn2' style={{float:'left',width:'150px'} }>Discriptions Extraction</label>

      </div>
      <div style={{display:'inline-block',float:'left', width:'300px', height:'60px'}}>
      <input name='selectaddr' placeholder='insert address for athorization' value={selectaddr} onChange={onChange} style={{width:'200px',height:'30px',float:'left'}}></input>
      <label  onClick={addAllowedUser}   className='custom-btn2'style={{float:'left',background:'red'}} >Authorize</label>
      <label  onClick={getCriminal}   className='custom-btn2' >criminal log</label>
<label type="fileupload" onClick={discriptorFromImage} id="fileup"  className='custom-btn2' >transaction</label>

      
      </div>
      <div>

      </div>

   </div>

    </div>

    <Web3Button  />    
    </div>
  </div>
  <Web3Modal projectId="ad51cb658b57c4bb5916b92e7f4a4ff7"ethereumClient={ethereumClient}/>

  </WagmiConfig>
  
   
  );
}




export default Footer;
