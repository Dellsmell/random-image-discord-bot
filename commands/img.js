const config = require("../config.json");
const {
    SlashCommandBuilder,
    spoiler,
} = require('@discordjs/builders');
const {
    MessageAttachment,
    MessageActionRow,
    MessageButton
} = require('discord.js');
const puppeteer = require('puppeteer');
const https = require("https");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("img")
        .setDescription(config.language.img_description.message),
    async execute(interation) {
        
        await interation.reply({
            content: config.language.img_message_pending.message,
            emphemeral: config.language.img_message_pending.emphemeral
        });
        try {
            let imgOBJ = await runner();
            let ext = imgOBJ.imageURL.split(".");
            var attachment = new MessageAttachment(imgOBJ.imageURL).setName(`SPOILER_${imgOBJ.imageId}.${ext[ext.length - 1]}`);

            const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('save-img')
					.setLabel('Save')
					.setStyle('PRIMARY'),
			);
            interation.editReply({
                content: config.language.img_message_success.message,
                files: [attachment],
                components: [row],
                emphemeral: config.language.img_message_success.emphemeral
            })
        } catch (err) {
            console.error(err);
            interation.editReply({
                content: config.language.error_message_img_failed.message,
                emphemeral: config.language.error_message_img_failed.emphemeral
            })
        }
    }
}



async function runner() {
    while (1 === 1) {
        var imgId = await getImgId();
        var imgOBJ = await getImgAddress(imgId);
        if (imgOBJ.imageURL !== "https://st.prntscr.com/2021/04/08/1538/img/0_173a7b_211be8ff.png" && imgOBJ.imageURL !== "https://st.prntscr.com/2022/05/15/0209/img/0_173a7b_211be8ff.png" && imgOBJ.errorStatus !== "404 Not Found") {
            return imgOBJ;
        }
    }
}


async function getImgId() {
    let pospString1 = "abcdefghijklmnopqrstuv";
    let pospString2 = "abcdefghijklmnopqrstuvwxyz";
    let int1 = Math.floor(Math.random() * 22);
    let int2 = Math.floor(Math.random() * 26);
    var int3 = Math.floor(Math.random() * 10000);
    var in3String = int3.toString()

    //Pads to make sure the number is allways 4 digest
    //If input is 4 output equals 0004
    var in3String = in3String.padStart(4, "0");

    let idLetter1 = pospString1[int1];
    let idLetter2 = pospString2[int2];

    let id = idLetter1 + idLetter2 + in3String
    console.log("Made Id: " + id)
    return id;
}


async function getImgAddress(id) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://prnt.sc/' + id);
    const imageURL = await page.$eval('.image-constrain.js-image-wrap .image-container.image__pic.js-image-pic .no-click.screenshot-image', img => img.src);
    await page.goto(imageURL);
    if(await page.$('body > center:nth-child(1) > h1') !== null) {
        var textValue = await page.$eval('body > center:nth-child(1) > h1', text => text.textContent);
        console.log(textValue)
    } else {
        var textValue = " "
    }
        browser.close();
        console.log("got url: " + imageURL)
    var imgObj = {
        imageURL: imageURL,
        imageId: id,
        errorStatus: textValue
    }
    return imgObj;
}