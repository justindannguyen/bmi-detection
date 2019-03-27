import React, { Component } from 'react';
import withWidth from '@material-ui/core/withWidth';
import './App.css';
import { mqttConfig, faceRecognition } from './configs/Constants'
import { Mqtt } from './configs/Mqtt'
import Dialog from '@material-ui/core/Dialog'
import Avatar from '@material-ui/core/Avatar'
import Grid from '@material-ui/core/Grid'
import Sound from 'react-sound';
import soundFile from './assests/alarm.mp3';
const soundManager = require('soundmanager2')

const topicPrefix = mqttConfig.appInstance ? mqttConfig.appInstance + '/' : ''
const detectionTopic = `${topicPrefix}${faceRecognition.faceDetection}`

class App extends Component {

  constructor() {
    super()
    this.mqttClient = new Mqtt(mqttConfig.broker, {})
    this.state = {
      data: [],
      open: false,
      face: { name: '', image: '' }
    }
  }

  componentDidMount() {
    this.mqttClient.connect()
    this.mqttClient.subscribe(detectionTopic, 0, this.handleMqttMessages)
  }

  componentWillUnmount() {
    this.mqttClient.unsubscribe(detectionTopic)
    this.mqttClient.disconnect()
  }

  handleMqttMessages = message => {
    try {
      const json = JSON.parse(message.toString())
      const { data } = this.state
      if (data.length > 5) {
        data.pop()
      }
      data.unshift(json)
      this.setState({ ...this.state, face: json, data, open: true })
    } catch (syntaxError) {
      //Skip in case of json is not correct
      console.log(syntaxError)
    }
  }

  handleClickOpen = () => {
    this.setState({ ...this.state, open: true })
  }

  handleEntered = () => {
    setTimeout(() => {
      this.setState({ ...this.state, open: false })
    }, 10000);
  }

  render() {
    const { face, data, open } = this.state
    const fullscreen = this.props.width === 'xs'
    console.log(this.props.width )
    return (
      <div className='dashboard'>
        <Dialog fullScreen={fullscreen} onEntered={this.handleEntered} aria-labelledby="simple-dialog-title"
          open={open} >
          <div className='popup-main'>
              <Avatar className='face-profile' alt={face.name} src={`data:image/jpg;base64,${face.image}`} />
            <Grid className='face-list' container justify="center" alignItems="center">
              {
                data.map((v, i) => (
                  <Grid key={i} item sx={2} md={2} className='face-box'>
                    <Avatar className='face-item' alt={v.name} src={`data:image/jpg;base64,${v.image}`} />
                  </Grid>
                ))
              }
            </Grid>
          </div>
        </Dialog>
        <Sound url={soundFile} playStatus={open ? Sound.status.PLAYING : Sound.status.STOPPED} autoLoad={true} loop={true} autoPlay={true}/>)
      </div>
    )
  }
}
 
export default withWidth()(App);
