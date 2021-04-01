

const socket = io()
const $messageForm = document.querySelector('#sende')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $location = document.querySelector('#location')
const $message = document.querySelector('#message')

const messageTemplate = document.querySelector('#message-template').innerHTML
const LocationmessagesTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username,room}  = Qs.parse(location.search, {ignoreQueryPrefix:true} )

const autoscroll = () => {
    const $newMessage  = $message.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    console.log(newMessageMargin);

    const visibleHeight = $message.offsetHeight

    const containerHeight = $message.scrollHeight

    const scrollOffset = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset ) {
        $message.scrollTop = $message.scrollHeight
    }



}


socket.on('messages',(message)=>{
    console.log(message);
})
socket.on('messages',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $message.insertAdjacentHTML('beforeend',html)  
    autoscroll()  
})
socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.on('Locationmessages',(message)=>{
    console.log(message.url);
    const html = Mustache.render(LocationmessagesTemplate,{
        username: message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm:a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')

    const message= e.target.elements.message.value
    socket.emit('message',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error) {
            return console.log(error);
        }
        console.log("message delivered");
    })
})

$location.addEventListener('click',() => {
   if(!navigator.geolocation) {
       return alert('Geolocation is not  supported by ur browser')
   } 
     $location.setAttribute('disabled','disabled')
   navigator.geolocation.getCurrentPosition((position)=>{
      
        socket.emit('sendLocation',{
           latitude: position.coords.latitude,
           longitude: position.coords.longitude
        },()=>{
            $location.removeAttribute('disabled')
            console.log("Location shared");
           
        })
   })
})

socket.emit('join',{username,room},(error)=> {
    if(error) {
        alert(error)
        location.href='/'
    }

})