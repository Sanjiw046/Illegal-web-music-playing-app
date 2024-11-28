console.log('js inclide')
let currentSong = new Audio();  //gobal variable for play the song
let songs=[];
let currFolder;

async function getSongs(folder){
    try{
        currFolder=folder;
        let a= await fetch(`http://127.0.0.1:5500/${folder}/`);
        let response =  await a.text();
        // console.log(response);

         // Create a temporary element to parse the HTML
        let div= document.createElement('div');
        div.innerHTML=response;
        // Find all 'a' elements within the parsed HTML
        let as = div.getElementsByTagName('a');
        songs= [];

        // Iterate through the links to find MP3 files
        for(let i=0;i<as.length;i++){
            const ele = as[i];
            if(ele.href.endsWith('.mp3')){
               let songName=(ele.href.split(`/${folder}/`)[1]);
               songs.push(songName);
            }
        }

         //show all the song in the playList
        let songUl=document.querySelector('.songlist').getElementsByTagName('ul')[0];
        songUl.innerHTML="";
        for (const song of songs) {
            let cleanedSong = song.replaceAll("%20", " ");
        // cleanedSong = cleanedSong.replaceAll(".mp3", "");
            songUl.innerHTML += `<li>
                                     <img class="invert" src="image/music.svg" alt="">
                                     <div class="info">
                                         <div>${cleanedSong}</div>
                                         <div>Sanjiw</div>
                                     </div>
                                                           
                                </li>`;
        }
        //attach event listner to each song
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e=>{
        
            e.addEventListener('click',(element)=>{
                console.log(e.querySelector('.info').firstElementChild.innerHTML);
                playMusic(e.querySelector('.info').firstElementChild.innerHTML.trim());
            })
        })
        return songs;
    }
    catch(err){
        console.log('songs are not found:'+err);
    } 
}

//function to play the music
const playMusic= (track,pause=false)=>{
    // let audio=new Audio("/songs/"+track + ".mp3");
    currentSong.src= `/${currFolder}/`+track;

    // Find the current playing song in the song list
    const songItem = document.querySelectorAll('.songlist li');
    const songInfo = document.querySelector('.songinfo');
    songInfo.innerHTML = `<span>${decodeURI(track)}</span>`;
    // songItem.forEach(item=>{
    //     const title = document.querySelector('.info').firstElementChild.innerHTML.trim();
    //     const playNowBtn= document.querySelector('.playnow img');
    //     // if(decodeURI(track)=== title){
    //     //     // If the current song is the one being played, change the button to 'pause'
    //     //     playNowBtn.src = pause ? "image/play.svg" : "image/pause.svg";
    //     // }
    //     // else{
    //     //     // Revert all other buttons back to 'play'
    //     //     playNowBtn.src = "image/play.svg";
    //     // }
    // });
    // if(!pause){
    //     currentSong.play();
    //     play.src= "image/pause.svg";
    // }
    if (!pause) {
        currentSong.play();
        document.getElementById('play').src = "image/pause.svg";
    } else {
        currentSong.pause();
        document.getElementById('play').src = "image/play.svg";
    }
    
    // document.querySelector('.songinfo').innerHTML=decodeURI(track);
    document.querySelector('.songtimer').innerHTML="00:00/00:00";
}


//function for convert sec to minute
function formatTime(seconds) {
    if(isNaN(seconds) || seconds<0){
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    // Ensure minutes and seconds are always two digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}

// function to display albums on the page
async function displayAlbums() {
    let a= await fetch(`http://127.0.0.1:5500/songs/`);
        let response =  await a.text();
        // console.log(response);

         // Create a temporary element to parse the HTML
        let div= document.createElement('div');
        div.innerHTML=response;
        let anchors = div.getElementsByTagName('a');
        let cardcontainer = document.querySelector('.cardcontainer');
        // cardcontainer.innerHTML = "";
        let array=Array.from(anchors)
        for(let index=0;index<array.length;index++){
            const e = array[index];
            if(e.href.includes('/songs')){
                // console.log(e.href.split('/').slice(-2)[1]);
                let folder = e.href.split('/').slice(-2)[1];
                // console.log(folder);
                //get the metadata of this folder
                if(folder!='songs'){
                    let a= await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
                let response =  await a.json();
                // console.log(response);
                cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}" class=" card">
              <div class="play">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  data-encore-id="icon"
                  role="img"
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  class="play-button-svg"
                  width="37px"
                  height="37px"
                >
                  <circle class="bg" cx="12" cy="12" r="12" />
                  <path
                    class="play-button"
                    d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"
                  />
                </svg>
              </div>

              <img
                src="/songs/${folder}/cover.jpeg"
                alt=""
              />
              <h5>${response.title}</h5>
              <p>${response.description}</p>
            </div>`
            }                 
            }
        }
        //load the playList whenever clicked on the playList card
         Array.from(document.getElementsByClassName('card')).forEach((e)=>{
            // console.log(e);
             e.addEventListener('click',async(item)=>{
                // console.log(item.currentTarget.dataset);
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            })
        })
        
}

async function main(){
    //get the list of all songs
    await getSongs("songs/olds");  //here ns is folder name
    // console.log(songs);
    playMusic(songs[1],true); 

   //Display all the albums on the page
   displayAlbums();
    
    //attach an eventlistner to play,previous and next
    play.addEventListener('click',()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "image/pause.svg";
        }
        else{
            currentSong.pause();
            play.src= "image/play.svg";
        }
    })

    //Listen for time update event
    currentSong.addEventListener('timeupdate',()=>{
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector('.songtimer').innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}` //the formatTime fuction we write above

        //for moving seekbar
        document.querySelector('.circle').style.left =(currentSong.currentTime/currentSong.duration)*100 +'%';
    })

    //MOVE seekbar circle 
    document.querySelector('.seekbar').addEventListener('click',(e)=>{
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let persent = ( e.offsetX/e.target.getBoundingClientRect().width) *100;
        document.querySelector('.circle').style.left = persent +'%';
        currentSong.currentTime = ((currentSong.duration)*persent)/100;
    })

    //Add an eventListner on hamburger
    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left').style.left="0";
    })
    //Add an eventListner on close button
    document.querySelector('.close').addEventListener('click',()=>{
        document.querySelector('.left').style.left= "-110%";
    })

    //Add eventListner to 'previous' 
    previous.addEventListener('click',()=>{
        let nowsong = currentSong.src.split('/').slice(-1)[0]; //ye song ko dega
        let index=songs.indexOf(nowsong);
        if((index) > 0){
            playMusic(songs[index-1]);
        }       
    })

    //Add eventListner to 'next'
    next.addEventListener('click',()=>{
        // console.log('click next')
        let nowsong = currentSong.src.split('/').slice(-1)[0]; //ye song ko dega
        let index=songs.indexOf(nowsong);
        // console.log(songs.length)
        if((index+1) < songs.length){
            playMusic(songs[index+1]);
        }
    })

    // Automatically play the next song when the current one ends
    currentSong.addEventListener('ended', ()=>{
        let nowsong = currentSong.src.split('/').slice(-1)[0];
        let index = songs.indexOf(nowsong);
        if((index + 1) < songs.length){
            playMusic(songs[index+1]);
        }
    });

    //Add an event to volume
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change',(e)=>{
        // console.log(e,e.target,e.target.value)
        currentSong.volume = e.target.value/100;
    })

    //add eventListner to mute the track
    document.querySelector('.volumebtn>img').addEventListener('click',(e)=>{
        // console.log(e.target);
        if(e.target.src.includes('volume.svg')){
            e.target.src=e.target.src.replace('image/volume.svg','image/mute.svg');
            currentSong.volume=0;
            document.querySelector('.range').getElementsByTagName('input')[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace('image/mute.svg','image/volume.svg');
            currentSong.volume=.10;
            document.querySelector('.range').getElementsByTagName('input')[0].value=50; 
        }
    })
  
}
main();



