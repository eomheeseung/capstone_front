import React from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Footer from "./Footer";
import NavBar from './NavBar';
import Main from './Main';
import Profile from './Profile'
import Detect from './Detect';

function Remoter()
{
 
 
    return(
      //etheprovider 태그로 감싸야 state 값 정의가된다. 지금은 리모터에서 감은게 main 
      //profile제작했을때에도 적용이 되어야한다.
      
        
    <BrowserRouter>
      <NavBar/>
        <Routes element={<NavBar/>}>
          <Route path='/Footer' element={<Footer/>}/> 
          <Route path='/' element={<Main/>}/>
          <Route path='/Profile' element={<Profile/>}/>
          <Route path='/Detect' element={<Detect/>}/>


        </Routes>

    </BrowserRouter>
       
    
    );
    
}

export default Remoter;
