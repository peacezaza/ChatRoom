let add_server_btu = document.getElementById('add_server')
let window_chat = document.getElementById('container')
let window_add_server = document.createElement('div')
let server_input = document.createElement('input')
let submit_server = document.createElement('button')
let server_bar = document.getElementById('server_bar')
add_server_btu.addEventListener('click' , ()=>
{
    
    submit_server.textContent = "Submit"
    submit_server.id = 'submit_add_server'
    server_input.id = 'server_name_input'
    // window_add_server.style.background = 'white'
    window_add_server.id = 'add_server_window'
    window_add_server.appendChild(server_input)
    window_add_server.appendChild(submit_server)
    window_chat.appendChild(window_add_server)
    // console.log("EiEi")
})

submit_server.addEventListener('click' , ()=>
{
    if(server_input.value)
    {
        let btu_server = document.createElement('button')
        btu_server.textContent = server_input.value
        server_bar.appendChild(btu_server)
        console.log(server_input.value)
        window_add_server.remove()
        submit_server.remove()
        server_input.remove()
        server_input.value = ""
    }
})

