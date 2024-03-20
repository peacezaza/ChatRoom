import'./ServerPage.css'

const get_server = ()=>{
    
}

function ServerPage(){
    return(
        <div className='con'>
            <div className="side-bar">
                <div>
                    <button className='addServer'></button>
                </div>
            </div>
            <div className="content">
                <div className='nav-bar'></div>
                <div className='channel'>
                    <div className='side-bar-channel'></div>
                    <div className='chat'>
                        <div>
                            <input type='text' className='ChatInput' placeholder='TypeHere...'/>
                        </div>
                        <div>
                            <button className='SubmitChat'></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}




export default ServerPage