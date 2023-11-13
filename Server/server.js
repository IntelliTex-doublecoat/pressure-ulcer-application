//import express
const express = require('express');

//import KalmanFilter
const KalmanFilter = require('kalmanjs');

//file read and write
const fs = require('fs')

//create server
const app = express()

//open server
app.listen(80, (req, res) => {
    console.log("running");

})

// ⬇️ right shoulder patch data
let shoulderRBackPressureOriginal = [];
let shoulderRBackPressureWindow = [];
let shoulderRBackPressureFiltered = [];
let shoulderRBackPressureThreshold = 900; // high pressure threshold
let shoulderRBackNowPressure = false; // whether it is high pressure
let shoulderRBackRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let shoulderRSidePressureOriginal = [];
let shoulderRSidePressureWindow = [];
let shoulderRSidePressureFiltered = [];
let shoulderRSidePressureThreshold = 900; // high pressure threshold
let shoulderRSideNowPressure = false; // whether it is high pressure
let shoulderRSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let shoulderRTempHumiOriginal = [];
let shoulderRTempHumiFiltered = [];
let shoulderRNowTemp = false; // whether it is high temperature
let shoulderRNowHumi = false; // whether it is high humidity
let shoulderRTempThreshold = 800; // high temperature threshold
let shoulderRHumiThreshold = 900; // high humidity threshold

// ⬇️ left elbow patch data
let elbowLBackPressureOriginal = [];
let elbowLBackPressureWindow = [];
let elbowLBackPressureFiltered = [];
let elbowLBackPressureThreshold = 1520; // high pressure threshold
let elbowLBackNowPressure = false; // whether it is high pressure
let elbowLBackRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let elbowLSidePressureOriginal = [];
let elbowLSidePressureWindow = [];
let elbowLSidePressureFiltered = [];
let elbowLSidePressureThreshold = 1600; // high pressure threshold
let elbowLSideNowPressure = false; // whether it is high pressure
let elbowLSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let elbowLTempHumiOriginal = [];
let elbowLTempHumiFiltered = [];
let elbowLNowTemp = false; // whether it is high temperature
let elbowLNowHumi = false; // whether it is high humidity
let elbowLTempThreshold = 1500; // high temperature threshold
let elbowLHumiThreshold = 1750; // high humidity threshold

// ⬇️ right elbow patch data
let elbowRBackPressureOriginal = [];
let elbowRBackPressureWindow = [];
let elbowRBackPressureFiltered = [];
let elbowRBackPressureThreshold = 900; // high pressure threshold
let elbowRBackNowPressure = false; // whether it is high pressure
let elbowRBackRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let elbowRSidePressureOriginal = [];
let elbowRSidePressureWindow = [];
let elbowRSidePressureFiltered = [];
let elbowRSidePressureThreshold = 900; // high pressure threshold
let elbowRSideNowPressure = false; // whether it is high pressure
let elbowRSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let elbowRTempHumiOriginal = [];
let elbowRTempHumiFiltered = [];
let elbowRNowTemp = false; // whether it is high temperature
let elbowRNowHumi = false; // whether it is high humidity
let elbowRTempThreshold = 800; // high temperature threshold
let elbowRHumiThreshold = 900; // high humidity threshold


// ⬇️ left shoulder patch data
let shoulderLBackPressureOriginal = [];
let shoulderLBackPressureWindow = [];
let shoulderLBackPressureFiltered = [];
let shoulderLBackPressureThreshold = 1750; // high pressure threshold
let shoulderLBackNowPressure = false; // whether it is high pressure
let shoulderLBackRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let shoulderLSidePressureOriginal = [];
let shoulderLSidePressureWindow = [];
let shoulderLSidePressureFiltered = [];
let shoulderLSidePressureThreshold = 1450; // high pressure threshold
let shoulderLSideNowPressure = false; // whether it is high pressure
let shoulderLSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let shoulderLTempHumiOriginal = [];
let shoulderLTempHumiWindow = [];
let shoulderLTempHumiFiltered = [];
let shoulderLNowTemp = false; // whether it is high temperature
let shoulderLNowHumi = false; // whether it is high humidity
let shoulderLTempThreshold = 1750; // high temperature threshold
let shoulderLHumiThreshold = 2000; // high humidity threshold

// ⬇️ hip patch data
let hipBackPressureOriginal = [];
let hipBackPressureWindow = [];
let hipBackPressureFiltered = [];
let hipBackPressureThreshold = 1850; // high pressure threshold
let hipBackNowPressure = false; // whether it is high pressure
let hipBackRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let hipRSidePressureOriginal = [];
let hipRSidePressureWindow = [];
let hipRSidePressureFiltered = [];
let hipRSidePressureThreshold = 1900; // high pressure threshold
let hipRSideNowPressure = false; // whether it is high pressure
let hipRSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let hipLSidePressureOriginal = [];
let hipLSidePressureWindow = [];
let hipLSidePressureFiltered = [];
let hipLSidePressureThreshold = 1700; // high pressure threshold
let hipLSideNowPressure = false; // whether it is high pressure
let hipLSideRiskState = { pressure: false, temp: false, humidity: false };// current risk judge state

let hipTempHumiOriginal = [];
let hipTempHumiWindow = [];
let hipTempHumiFiltered = [];
let hipNowTemp = false; // whether it is high temperature
let hipNowHumi = false; // whether it is high humidity
let hipTempThreshold = 2150; // high temperature threshold
let hipHumiThreshold = 2400; // high humidity threshold

// kalmanfilter instance
let kalmanFilterShoulderR = new KalmanFilter({ R: 0.01, Q: 20 }); //Q: 20
let kalmanFilterShoulderL = new KalmanFilter({ R: 0.01, Q: 20 }); //Q: 20
let kalmanFilterElbowL = new KalmanFilter({ R: 0.01, Q: 20 }); //Q: 20
let kalmanFilterElbowR = new KalmanFilter({ R: 0.01, Q: 20 }); //Q: 20
let kalmanFilterHip = new KalmanFilter({ R: 0.01, Q: 20 }); //Q: 20

// If there is a change in this array, it will be sent back to the front-end, and if there is no change, it will not be sent.
let warningMessageChange = false;
let warningMessage = [];

function warningMessageAdd(type, area) {
    if (type == "backPressure") {
        warningMessage.push({
            type: "pressure",
            area: area,
            message: `
                <p>Lying flat for too long and detecting prolonged pressure on ${area}, it is recommended to change the lying position to lying on the side. The following points need to be followed during the process of turning over:</p>
                <p>1.Transitioning the care recipient from a lying position to a side lying position requires gently transferring the care recipient's legs, arms, and head to one side until the care recipient is lying on his or her side. Once the transfer is complete, the care recipient's body needs to be stabilized to prevent him or her from tipping forward or backward, and sheets and pillows need to be adjusted to ensure the care recipient's comfort and stability.</p>
                <p>2.You need to keep your hands clean when turning to avoid risks such as infection to the care recipient's body.</p>
                <p>3.Check sheets and mattresses for wrinkles to avoid excessive skin friction when turning. It is also necessary to minimize high shear forces when turning, i.e. not rubbing the skin against the bed surface. It is recommended to use tools such as nursing pads or wipes to turn the care recipient's body as a whole, rather than dragging the body directly.</p>
                <p>4.When turning, care needs to be taken not to twist the care recipient's body excessively to avoid additional injury.Care recipients should be allowed to maintain the natural curves of their bodies as much as possible and be properly supported.</p>
                <p>5.Work in pairs when available, with one person supporting the care recipient's body and the other turning him or her.Gently slide the care recipient's body without pulling.</p>
                <p>After turning over, the skin in the scapula area (or other areas of skin where chronic high pressure has been detected, such as the back of the elbow, the sacral area, etc.) needs to be checked for damage. If redness, swelling, or broken skin is detected, the skin needs to be cleaned and dressed. Dressings need to be selected on a case-by-case basis and you should consult your doctor or nurse before applying them. If the skin damage is found to be more serious, you need to seek medical advice and follow the doctor's instructions.</p>
            `
        })
    }
    else if (type == "sidePressure") {
        warningMessage.push({
            type: "pressure",
            area: area,
            message: `
                <p>Lying on the side for too long and detecting prolonged pressure on ${area}, it is recommended to change the lying position to lying flat. The following points need to be followed during the process of turning over:</p>
                <p>1.Transitioning the care recipient from a side-lying position to a lying position involves laying the person on their side to the edge of the bed, then dangling the legs, supporting the lower back while gently sliding the care recipient's body into a lying position in the center of the bed, with care being taken to ensure that the body is smooth and unobstructed.</p>
                <p>2.You need to keep your hands clean when turning to avoid risks such as infection to the care recipient's body.</p>
                <p>3.Check the sheets for wrinkles to avoid causing excessive skin friction when turning over.It is also necessary to minimize high shear forces when turning and not rub the skin against the bed surface. It is recommended to use tools such as nursing pads or wipes to turn the care recipient's body as a whole rather than dragging the body directly.</p>
                <p>4.When turning, care needs to be taken not to twist the care recipient's body excessively to avoid additional injury.The care recipient should be allowed to maintain the natural curves of the body and be supported appropriately.Specifically, after the care recipient has been turned into a lying position, the care recipient's body posture should be adjusted in a timely manner so that all parts of the body, especially the head, neck and lower back, are reasonably supported to avoid excessive bending or twisting.</p>
                <p>5.Work in pairs when available, with one person supporting the care recipient's body and the other turning him or her.Gently slide the care recipient's body without pulling.</p>
                <p>After turning over, the skin on the upper part of the large arm (or other areas of skin where chronic high pressure has been detected, such as the side of the elbow, hip, etc.) needs to be checked for damage.If redness, swelling, or broken skin is detected, the skin needs to be cleaned and dressed. Dressings need to be chosen on a case-by-case basis and you should consult your doctor or nurse before applying them.If the skin damage is found to be more serious, you need to seek medical advice and follow the doctor's instructions.</p>
            `
        })
    }
    else if (type == "temp") {
        warningMessage.push({
            type: "temp",
            area: area,
            message: `
                <p>Monitor ${area} high temperatures.</p>
                <p>First, high temperatures in these areas may be caused by the care recipient's body remaining in the same position for too long where the skin has difficulty dissipating heat. Consider changing the current lying body position. Points to keep in mind during caregiving can be found in the previous two articles. </p>
                <p>Secondly, localized high temperatures in the body can also be caused by high room temperatures, so pay attention to ventilation and cooling by keeping the room ventilated and allowing air to circulate around the body of the person being cared for.You can also use devices such as electric fans or air conditioners to lower the temperature in the room.</p>
                <p>Finally, a slightly moist, soft towel or gauze can be used to gently cool the skin by wiping the hot area.Be careful that the towel is not overly moist, as this can increase the risk of bedsores due to high humidity.</p>
            `
        })
    }
    else if (type == "humidity") {
        warningMessage.push({
            type: "humidity",
            area: area,
            message: `
                <p>High humidity in ${area} is monitored.It is recommended to clean the corresponding area of skin and the following points need to be followed during the cleaning process:</p>
                <p>1.First, prepare the required cleansing products.Unscented soaps or specialized skin cleansers are generally recommended to avoid skin irritation.Wet the affected skin area with warm water, avoiding water that is too hot or too cold, as this will soften the skin and aid in cleansing.</p>
                <p>2.Take an appropriate amount of soap or cleanser and gently apply it to the skin, taking care not to rub or friction the skin too hard as this may cause skin damage.The surface of the skin can be gently cleaned with a soft-bristled brush or sponge, taking care not to rub too hard, as this may aggravate the risk of skin breakdown and infection.</p>
                <p>3.Rinse thoroughly with lukewarm water to make sure there is no soap or detergent residue on your skin.</p>
                <p>Gently pat dry with a clean, soft towel and do not rub or rub the skin hard enough to re-irritate it.Make sure the affected skin is dry. If the affected skin does not dry easily, use a hairdryer or fan to gently dry it. Finally, change the bed linen as well as clothing. It is best to use breathable mattresses and sheets, and avoid plastic or rubber products.</p>
            `
        })
    }
}

/**
 * For pressure data filtering: Window filtering
 * @param {float} newData New data to be pushed in
 * @param {Array} dataArray Filter Window Array
 * @param {Array} filteredArray Filtered data storage array
 */
function windowFilter(newData, dataArray, filteredArray) {
    let windowWid = 6;
    // add new data to dataArray 
    dataArray.push(newData);

    // If the number of elements in dataArray is greater than windowWid, filter and add the result to filteredArray
    if (dataArray.length >= windowWid) {
        let sum = dataArray.reduce((acc, val) => acc + val, 0);
        let filteredData = sum / windowWid;

        filteredArray.push({ "time": filteredArray.length * 2, "sensorVal": filteredData }); //*2, since sample every 2s
        dataArray.shift();
    }
}

/**
 * receive data sent by the sensor patches, GET request format: http://172.20.10.7/sendData?data=[json format data]
 */
app.get('/sendData/', (req, res) => {

    let reqData = eval("(" + req.query.data + ")"); // the data received

    console.log(reqData);

    // process shoulder data
    // Update warningMessage regardless of shoulder/elbow/hip detection of high risk
    // right shoulder
    if (reqData.patch == "shoulderR") {
        shoulderRBackPressureOriginal.push(reqData.backPressure);
        shoulderRSidePressureOriginal.push(reqData.sidePressure);
        shoulderRTempHumiOriginal.push(reqData.tempHumi);
        let isBackNormal = true; // Is the back data normal
        let isSideNormal = true; // Is the side data normal

        // temp_humidity Kalman filter
        {
            //Directly use the read voltage value, not converted to resistance
            let filteredData = kalmanFilterShoulderR.filter(reqData.tempHumi);
            shoulderRTempHumiFiltered.push({ "time": shoulderRTempHumiFiltered.length * 2, "sensorVal": filteredData }); //*2, since sample every 2s
            // Determine if the data is below the temperature threshold
            if (filteredData < shoulderRTempThreshold) {
                isBackNormal = false;
                isSideNormal = false;
                // update both back and side
                shoulderRBackRiskState.temp = true;
                shoulderRSideRiskState.temp = true;

                if (shoulderRNowTemp == false) // Just started high temp
                {
                    shoulderRNowTemp = true;
                    warningMessageAdd("temp", "right shoulder");
                }
            }
            else { // No high temperatures
                shoulderRBackRiskState.temp = false;
                shoulderRNowTemp = false;
            }

            // Determine if data is above humidity threshold
            if (filteredData > shoulderRHumiThreshold) {
                isBackNormal = false;
                isSideNormal = false;
                // update both back and side
                shoulderRBackRiskState.humidity = true;
                shoulderRSideRiskState.humidity = true;
                if (shoulderRNowHumi == false) // Just started high humidity
                {
                    shoulderRNowHumi = true;
                    warningMessageAdd("humidity", "right shoulder");
                }
            }
            else { // No high humidity
                shoulderRBackRiskState.humidity = false;
                shoulderRNowHumi = false;
            }
        }

        // pressure filter
        windowFilter(reqData.backPressure, shoulderRBackPressureWindow, shoulderRBackPressureFiltered)

        if (shoulderRBackPressureFiltered.length != 0) // not null
        {
            // Determine if the new filtered data is below the threshold value
            if (shoulderRBackPressureFiltered[shoulderRBackPressureFiltered.length - 1].sensorVal < shoulderRBackPressureThreshold) {
                isBackNormal = false;
                shoulderRBackRiskState.pressure = true;
                if (shoulderRBackNowPressure == false && !hipNowHumi && !hipNowTemp) // High pressure has just started and there are no high temperatures or high humidity conditions
                {
                    shoulderRBackNowPressure = true;
                    warningMessageAdd("backPressure", "right shoulder - back");
                }
            }
            else { // no pressure
                shoulderRBackRiskState.pressure = false;
                shoulderRBackNowPressure = false;
            }
        }

        // Side pressure filtering
        windowFilter(reqData.sidePressure, shoulderRSidePressureWindow, shoulderRSidePressureFiltered)

        if (shoulderRSidePressureFiltered.length != 0) // not null
        {
            // Determine if the new filtered data is below the threshold value
            if (shoulderRSidePressureFiltered[shoulderRSidePressureFiltered.length - 1].sensorVal < shoulderRSidePressureThreshold) {
                isSideNormal = false;
                shoulderRSideRiskState.pressure = true;
                if (shoulderRSideNowPressure == false && !hipNowHumi && !hipNowTemp) // High pressure has just started and there are no high temperatures or high humidity conditions
                {
                    shoulderRSideNowPressure = true;
                    warningMessageAdd("sidePressure", "right shoulder - side");
                }
            }
            else { // no pressure
                shoulderRSideRiskState.pressure = false;
                shoulderRSideNowPressure = false;
            }
        }

        // If the back is normal
        if (isBackNormal) {
            shoulderRBackRiskState.pressure = false;
            shoulderRBackRiskState.temp = false;
            shoulderRBackRiskState.humidity = false;
        }

        // If the side is normal
        if (isSideNormal) {
            shoulderRSideRiskState.pressure = false;
            shoulderRSideRiskState.temp = false;
            shoulderRSideRiskState.humidity = false;
        }
    }

    // left shoulder
    if (reqData.patch == "shoulderR") {
        shoulderLBackPressureOriginal.push(reqData.backPressure);
        shoulderLSidePressureOriginal.push(reqData.sidePressure);
        shoulderLTempHumiOriginal.push(reqData.tempHumi);
        let isBackNormal = true; // Is the back data normal
        let isSideNormal = true; // Is the side data normal

        // temp_humidity Kalman filter
        {
            //Directly use the read voltage value, not converted to resistance
            let filteredData = kalmanFilterShoulderL.filter(reqData.tempHumi);
            shoulderLTempHumiFiltered.push({ "time": shoulderLTempHumiFiltered.length * 2, "sensorVal": filteredData }); //*2, since sample every 2s
            // Determine if the data is below the temperature threshold
            if (filteredData < shoulderLTempThreshold) {
                isBackNormal = false;
                isSideNormal = false;
                // update both back and side
                shoulderLBackRiskState.temp = true;
                shoulderLSideRiskState.temp = true;

                if (shoulderLNowTemp == false) // Just started high temp
                {
                    shoulderLNowTemp = true;
                    warningMessageAdd("temp", "left shoulder");
                }
            }
            else { // No high temperatures
                shoulderLBackRiskState.temp = false;
                shoulderLNowTemp = false;
            }

            // Determine if data is above humidity threshold
            if (filteredData > shoulderLHumiThreshold) {
                isBackNormal = false;
                isSideNormal = false;
                // update both back and side
                shoulderLBackRiskState.humidity = true;
                shoulderLSideRiskState.humidity = true;
                if (shoulderLNowHumi == false) // Just started high humidity
                {
                    shoulderLNowHumi = true;
                    warningMessageAdd("humidity", "left shoulder");
                }
            }
            else { // No high humidity
                shoulderLBackRiskState.humidity = false;
                shoulderLNowHumi = false;
            }
        }

        // pressure filter
        windowFilter(reqData.backPressure, shoulderLBackPressureWindow, shoulderLBackPressureFiltered)

        if (shoulderLBackPressureFiltered.length != 0) // not null
        {
            // Determine if the new filtered data is below the threshold value
            if (shoulderLBackPressureFiltered[shoulderLBackPressureFiltered.length - 1].sensorVal < shoulderLBackPressureThreshold) {
                isBackNormal = false;
                shoulderLBackRiskState.pressure = true;
                if (shoulderLBackNowPressure == false && !hipNowHumi && !hipNowTemp) // High pressure has just started and there are no high temperatures or high humidity conditions
                {
                    shoulderLBackNowPressure = true;
                    warningMessageAdd("backPressure", "left shoulder - back");
                }
            }
            else { // no pressure
                shoulderLBackRiskState.pressure = false;
                shoulderLBackNowPressure = false;
            }
        }

        // Side pressure filtering
        windowFilter(reqData.sidePressure, shoulderLSidePressureWindow, shoulderLSidePressureFiltered)

        if (shoulderLSidePressureFiltered.length != 0) // not null
        {
            // Determine if the new filtered data is below the threshold value
            if (shoulderLSidePressureFiltered[shoulderLSidePressureFiltered.length - 1].sensorVal < shoulderLSidePressureThreshold) {
                isSideNormal = false;
                shoulderLSideRiskState.pressure = true;
                if (shoulderLSideNowPressure == false && !hipNowHumi && !hipNowTemp) // High pressure has just started and there are no high temperatures or high humidity conditions
                {
                    shoulderLSideNowPressure = true;
                    warningMessageAdd("sidePressure", "left shoulder - side");
                }
            }
            else { // no pressure
                shoulderLSideRiskState.pressure = false;
                shoulderLSideNowPressure = false;
            }
        }

        // If the back is normal
        if (isBackNormal) {
            shoulderLBackRiskState.pressure = false;
            shoulderLBackRiskState.temp = false;
            shoulderLBackRiskState.humidity = false;
        }

        // If the side is normal
        if (isSideNormal) {
            shoulderLSideRiskState.pressure = false;
            shoulderLSideRiskState.temp = false;
            shoulderLSideRiskState.humidity = false;
        }
    }

    // left elbow
    if (reqData.patch == "elbowL") {
        elbowLBackPressureOriginal.push(reqData.backPressure);
        elbowLSidePressureOriginal.push(reqData.sidePressure);
        elbowLTempHumiOriginal.push(reqData.tempHumi);
        let isBackNormal = true; 
        let isSideNormal = true;

        // ⬇️ temp kalman filter
        {
            let filteredData = kalmanFilterElbowL.filter(reqData.tempHumi);
            elbowLTempHumiFiltered.push({ "time": elbowLTempHumiFiltered.length * 2, "sensorVal": filteredData });

            if (filteredData < elbowLTempThreshold) {
                isBackNormal = false;
                isSideNormal = false;

                elbowLBackRiskState.temp = true;
                elbowLSideRiskState.temp = true;

                if (elbowLNowTemp == false) 
                {
                    elbowLNowTemp = true;
                    warningMessageAdd("temp", "left elbow");
                }
            }
            else { 
                elbowLBackRiskState.temp = false;
                elbowLNowTemp = false;
            }

            if (filteredData > elbowLHumiThreshold) {
                isBackNormal = false;
                isSideNormal = false;

                elbowLBackRiskState.humidity = true;
                elbowLSideRiskState.humidity = true;
                if (elbowLNowHumi == false) 
                {
                    elbowLNowHumi = true;
                    warningMessageAdd("humidity", "left elbow");
                }
            }
            else { 
                elbowLBackRiskState.humidity = false;
                elbowLNowHumi = false;
            }
        }

        windowFilter(reqData.backPressure, elbowLBackPressureWindow, elbowLBackPressureFiltered)

        if (elbowLBackPressureFiltered.length != 0) 
        {
            if (elbowLBackPressureFiltered[elbowLBackPressureFiltered.length - 1].sensorVal < elbowLBackPressureThreshold) {
                isBackNormal = false;
                elbowLBackRiskState.pressure = true;
                if (elbowLBackNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    elbowLBackNowPressure = true;
                    warningMessageAdd("backPressure", "left elbow back");
                }
            }
            else {
                elbowLBackRiskState.pressure = false;
                elbowLBackNowPressure = false;
            }
        }

        windowFilter(reqData.sidePressure, elbowLSidePressureWindow, elbowLSidePressureFiltered)

        if (elbowLSidePressureFiltered.length != 0)
        {
            if (elbowLSidePressureFiltered[elbowLSidePressureFiltered.length - 1].sensorVal < elbowLSidePressureThreshold) {
                isSideNormal = false;
                elbowLSideRiskState.pressure = true;
                if (elbowLSideNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    elbowLSideNowPressure = true;
                    warningMessageAdd("sidePressure", "left elbow side");
                }
            }
            else {
                elbowLSideRiskState.pressure = false;
                elbowLSideNowPressure = false;
            }
        }

        if (isBackNormal) {
            elbowLBackRiskState.pressure = false;
            elbowLBackRiskState.temp = false;
            elbowLBackRiskState.humidity = false;
        }

        if (isSideNormal) {
            elbowLSideRiskState.pressure = false;
            elbowLSideRiskState.temp = false;
            elbowLSideRiskState.humidity = false;
        }

    }

    // right elbow
    if (reqData.patch == "elbowR") {
        elbowRBackPressureOriginal.push(reqData.backPressure);
        elbowRSidePressureOriginal.push(reqData.sidePressure);
        elbowRTempHumiOriginal.push(reqData.tempHumi);
        let isBackNormal = true;
        let isSideNormal = true;

        // ⬇️ temp_humi kalman filter
        {
            let filteredData = kalmanFilterElbowR.filter(reqData.tempHumi);
            elbowRTempHumiFiltered.push({ "time": elbowRTempHumiFiltered.length * 2, "sensorVal": filteredData });

            if (filteredData < elbowRTempThreshold) {
                isBackNormal = false;
                isSideNormal = false;

                elbowRBackRiskState.temp = true;
                elbowRSideRiskState.temp = true;

                if (elbowRNowTemp == false)
                {
                    elbowRNowTemp = true;
                    warningMessageAdd("temp", "right elbow");
                }
            }
            else {
                elbowRBackRiskState.temp = false;
                elbowRNowTemp = false;
            }

            if (filteredData > elbowRHumiThreshold) {
                isBackNormal = false;
                isSideNormal = false;

                elbowRBackRiskState.humidity = true;
                elbowRSideRiskState.humidity = true;
                if (elbowRNowHumi == false) 
                {
                    elbowRNowHumi = true;
                    warningMessageAdd("humidity", "right elbow");
                }
            }
            else { 
                elbowRBackRiskState.humidity = false;
                elbowRNowHumi = false;
            }
        }

        windowFilter(reqData.backPressure, elbowRBackPressureWindow, elbowRBackPressureFiltered)

        if (elbowRBackPressureFiltered.length != 0)
        {
            if (elbowRBackPressureFiltered[elbowRBackPressureFiltered.length - 1].sensorVal < elbowRBackPressureThreshold) {
                isBackNormal = false;
                elbowRBackRiskState.pressure = true;
                if (elbowRBackNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    elbowRBackNowPressure = true;
                    warningMessageAdd("backPressure", "right elbow back");
                }
            }
            else {
                elbowRBackRiskState.pressure = false;
                elbowRBackNowPressure = false;
            }
        }

        windowFilter(reqData.sidePressure, elbowRSidePressureWindow, elbowRSidePressureFiltered)

        if (elbowRSidePressureFiltered.length != 0)
        {
            if (elbowRSidePressureFiltered[elbowRSidePressureFiltered.length - 1].sensorVal < elbowRSidePressureThreshold) {
                isSideNormal = false;
                elbowRSideRiskState.pressure = true;
                if (elbowRSideNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    elbowRSideNowPressure = true;
                    warningMessageAdd("sidePressure", "right elbow");
                }
            }
            else {
                elbowRSideRiskState.pressure = false;
                elbowRSideNowPressure = false;
            }
        }

        if (isBackNormal) {
            elbowRBackRiskState.pressure = false;
            elbowRBackRiskState.temp = false;
            elbowRBackRiskState.humidity = false;
        }

        if (isSideNormal) {
            elbowRSideRiskState.pressure = false;
            elbowRSideRiskState.temp = false;
            elbowRSideRiskState.humidity = false;
        }
    }

    // hip data process
    if (reqData.patch == "hip") {
        hipBackPressureOriginal.push(reqData.backPressure);
        hipRSidePressureOriginal.push(reqData.sidePressureR);
        hipLSidePressureOriginal.push(reqData.sidePressureL);
        hipTempHumiOriginal.push(reqData.tempHumi);
        let isBackNormal = true;
        let isSideNormalR = true;
        let isSideNormalL = true;


        // ⬇️ temp_humi kalman
        {
            windowFilter(reqData.tempHumi, hipTempHumiWindow, hipTempHumiFiltered)

            if (hipTempHumiFiltered.length != 0) {
                if (hipTempHumiFiltered[hipTempHumiFiltered.length - 1].sensorVal < hipTempThreshold) {
                    isBackNormal = false;
                    isSideNormalR = false;
                    isSideNormalL = false;

                    hipBackRiskState.temp = true;
                    hipRSideRiskState.temp = true;
                    hipLSideRiskState.temp = true;
                    if (hipNowTemp == false) 
                    {
                        hipNowTemp = true;
                        warningMessageAdd("temp", "hip/sacrum");
                    }
                }
                else {
                    hipBackRiskState.temp = false;
                    hipRSideRiskState.temp = false;
                    hipLSideRiskState.temp = false;
                    hipNowTemp = false;
                }

                if (hipTempHumiFiltered[hipTempHumiFiltered.length - 1].sensorVal > hipHumiThreshold) {
                    isBackNormal = false;
                    isSideNormalR = false;
                    isSideNormalL = false;

                    hipBackRiskState.humidity = true;
                    hipRSideRiskState.humidity = true;
                    hipLSideRiskState.humidity = true;

                    if (hipNowHumi == false)
                    {
                        hipNowHumi = true;
                        warningMessageAdd("humidity", "hip/sacrum");
                    }
                }
                else {
                    hipBackRiskState.humidity = false;
                    hipRSideRiskState.humidity = false;
                    hipLSideRiskState.humidity = false;
                    hipNowHumi = false;
                }
            }
        }

        windowFilter(reqData.backPressure, hipBackPressureWindow, hipBackPressureFiltered)

        if (hipBackPressureFiltered.length != 0)
        {
            if (hipBackPressureFiltered[hipBackPressureFiltered.length - 1].sensorVal < hipBackPressureThreshold) {
                isBackNormal = false;
                hipBackRiskState.pressure = true;
                if (hipBackNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    hipBackNowPressure = true;
                    warningMessageAdd("backPressure", "sacrum");
                }
            }
            else { 
                hipBackRiskState.pressure = false;
                hipBackNowPressure = false;
            }
        }

        windowFilter(reqData.sidePressureR, hipRSidePressureWindow, hipRSidePressureFiltered)

        if (hipRSidePressureFiltered.length != 0) 
        {
            if (hipRSidePressureFiltered[hipRSidePressureFiltered.length - 1].sensorVal < hipRSidePressureThreshold) {
                isSideNormalR = false;
                hipRSideRiskState.pressure = true;
                if (hipRSideNowPressure == false && !hipNowHumi && !hipNowTemp)
                {
                    hipRSideNowPressure = true;
                    warningMessageAdd("sidePressure", "right hip");
                }
            }
            else {
                hipRSideRiskState.pressure = false;
                hipRSideNowPressure = false;
            }
        }

        windowFilter(reqData.sidePressureL, hipLSidePressureWindow, hipLSidePressureFiltered)

        if (hipLSidePressureFiltered.length != 0) 
        {
            if (hipLSidePressureFiltered[hipLSidePressureFiltered.length - 1].sensorVal < hipLSidePressureThreshold) {
                isSideNormalL = false;
                hipLSideRiskState.pressure = true;
                if (hipLSideNowPressure == false && !hipNowHumi && !hipNowTemp) 
                {
                    hipLSideNowPressure = true;
                    warningMessageAdd("sidePressure", "left hip");
                }
            }
            else {
                hipLSideRiskState.pressure = false;
                hipLSideNowPressure = false;
            }
        }

        if (isBackNormal) {
            hipBackRiskState.pressure = false;
            hipBackRiskState.temp = false;
            hipBackRiskState.humidity = false;
        }

        if (isSideNormalR) {
            hipRSideRiskState.pressure = false;
            hipRSideRiskState.temp = false;
            hipRSideRiskState.humidity = false;
        }

        if (isSideNormalL) {
            hipLSideRiskState.pressure = false;
            hipLSideRiskState.temp = false;
            hipLSideRiskState.humidity = false;
        }

        // If the temperature and humidity alarm is up, it means that the pressure sensor is invalid, don't pressure alarm up, or it will generate an alarm message
        if (hipBackRiskState.temp || hipBackRiskState.humidity || hipRSideRiskState.temp || hipRSideRiskState.humidity || hipLSideRiskState.temp || hipLSideRiskState.humidity) {
            hipBackRiskState.pressure = false;
            hipRSideRiskState.pressure = false;
            hipLSideRiskState.pressure = false;
        }
    }

    res.send("get success!");
})

// Save filtered data: filteredArray
app.get('/saveData', function (req, res) {
    const now = new Date();
    const month = now.getMonth() + 1; 
    const date = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const formattedTime = (month < 10 ? '0' : '') + month + '-' + (date < 10 ? '0' : '') + date + ' ' + (hours < 10 ? '0' : '') + hours + ':' + (minutes < 10 ? '0' : '') + minutes;

    fs.writeFile(`/Users/data_collection/${req.query.name}_${formattedTime}.json`, JSON.stringify(filteredArray), function (err) {
        if (err) throw err;
        console.log('Sensor data saved as JSON file!');
    });
})

//provide external static resource
app.use(express.static('public'));