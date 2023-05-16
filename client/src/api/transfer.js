import axios from "axios";

let realData = {};

// 0번째만 뽑기
function dataPerLoop(array) {
    // for (let i = 0; i < array.length; i++) {
    //     // console.log(array[i]); // 배열의 각 요소를 출력
    //     const key = 'key' + i;
    //     const value = array[i];
    //     realData[key] = value;
    // }

    const loop = (array) => array.forEach((value, i) => realData['key' + i] = value);

    // realData는 javascript 형식의 객체임
    console.log(realData.key0);
    console.log(typeof (realData.key0));

    const jsonString = JSON.stringify(realData.key0);
    console.log(jsonString);
    return jsonString;
}

// 128개 다 loop 돌리면서 json으로 바꿈
function loop(array) {
    // array를 stream으로 loop

    const realData = array.reduce((acc, cur, i) => ({ ...acc, [`key${i}`]: cur }), {});

    // realData는 javascript 형식의 객체임
    const jsonString = JSON.stringify(realData);

    // console.log(jsonString);
    // console.log(typeof (jsonString));
    return jsonString;
}

export const transferData = async (target) => {
    // console.log(target);
    // const jsonString = dataPerloop(target);
    const jsonString = loop(target);

    const config = { "Content-Type": "application/json" };
    const response = await axios.post('/test', jsonString, config);

    return response.data;
}


// 범죄자 데이터 (이미 저장되어 있는 discriptor)
export const criminalTransfer = async (data) => {
    const criminalString = data;
    const config = { "Content-Type": "application/json" };
    const response = await axios.post('/crime', criminalString, config);

    return response.data;
}