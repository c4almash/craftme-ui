import React, { Component } from 'react';
import io from 'socket.io-client/dist/socket.io.js';
import axios from 'axios';
import Peer from 'simple-peer';
import TextToTranslate from './TextToTranslate.jsx';
import LanguageSelector from './LanguageSelector.jsx';
import SimpleModal from './Modal.jsx';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      messages: [],
      feedback: '',
      translateFrom: '',
      translateTo: '',
      otherUser: '',
      displayStatus: 'hidden-element',
    };
    this.username = this.props.currentUser;
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
  }
  componentDidMount() { 
    this.socket = io(`${process.env.SOCKET_PATH}/`);
    this.socket.on('connect', () => {
      this.socket.emit('room', {
        room: this.props.roomId,
        username: this.username,
      });
    });
    this.socket.on('confirmation', (data) => {
      console.log('message from server', data);
      this.socket.emit('renderChat', {
        messages: this.state.messages,
        room: this.props.roomId,
        username: this.username,
      });
      this.setState({ otherUser: data.username });
      this.setPanel();
    });
    this.socket.on('renderChat', (data) => {
      this.setState({
        messages: [...data.messages],
        otherUser: data.username,
      });
    });
    this.socket.on('chat', (data) => {
      this.setState({
        messages: [...this.state.messages, data],
        feedback: '',
      });
    });
    this.socket.on('typing', (data) => {
      this.setState({ feedback: data });
    });
    this.socket.on('offer', (offer) => {
      this.peer.signal(JSON.parse(offer));
    });

    navigator.getUserMedia({ video: true, audio: true }, (stream) => {
      this.stream = stream;
      this.peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });
      this.peer.on('signal', (data) => {
        this.socket.emit('answer', {
          room: this.props.roomId,
          answer: JSON.stringify(data),
        });
      });
      this.peer.on('connect', () => console.log('PEER CONNECTED'));
      this.peer.on('stream', (stream) => {
        const video = document.createElement('video');
        this.video = video;
        this.videoContainer.append(video);
        video.src = window.URL.createObjectURL(stream);
        video.play();
      });
    }, err => console.log('err', err));
  }

  componentWillUnmount() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }

  setText(e) {
    this.setState({ message: e.target.value });
    this.socket.emit('typing', {
      room: this.props.roomId,
      feedback: `${this.username} is typing...`,
    });
  }

  setColor(username) {
    return username === this.username ? 'user-handle' : 'other-user-handle';
  }

  setPanel() {
    setTimeout(() => {
      this.setState({ displayStatus: 'hidden-element' });
    }, 3000);
    this.setState({ displayStatus: 'visible-element' });
  }

  sendChat() {
    this.socket.emit('chat', {
      room: this.props.roomId,
      handle: this.username,
      message: this.state.message,
    });
    this.setState({ message: '' });
  }

  callPeer() {
    navigator.getUserMedia({ video: true, audio: true }, (stream) => {
      this.peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });
      this.peer.on('signal', (data) => {
        this.socket.emit('offer', {
          room: this.props.roomId,
          offer: JSON.stringify(data),
        });
      });
      this.socket.on('answer', (answer) => {
        this.peer.signal(JSON.parse(answer));
      });
      this.peer.on('connect', () => console.log('PEER CONNECTED from callpeer'));
      this.peer.on('stream', (stream) => {
        const video = document.createElement('video');
        this.video = video;
        this.videoContainer.append(video);
        video.src = window.URL.createObjectURL(stream);
        video.play();
      });
    }, err => console.log('err', err));
  }

  endCall() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
  }

  pauseCall() {
    this.video.pause();
  }

  resumeCall() {
    this.video.play();
  }

  selectLanguage(e) {
    e.target.name === 'from' ?
    this.setState({ translateFrom: e.target.value }) :
    this.setState({ translateTo: e.target.value });
  }

  ifEnter(cb) {
    return (e) => {
      if (e.key == 'Enter') {
        return cb();
      }
    };
  }

  async saveChat () {
    const { messages } = this.state;
    const { teacher_id, student_id, roomId, title } = this.props;
    try {
      const {data} = await axios.post(`${process.env.REST_PATH}/user/saveLesson/`, {
        messages,
        teacher_id,
        student_id,
        title,
        roomId,
      });
      if (data) { 
        if (this.props.currentType === 0) {
          this.props.history.push('/lessons');
        }
        else {
          this.props.history.push('/feedback', data);
        }
      }
    } catch (err) {
      console.log('err from saveChat', err);
    }
  }
  
  render() {
    return (
      <div className="conference-container">
        <div className="upper-container">
          <div className="video-container" ref={(input) => { this.videoContainer = input; }} />
          <div className="info-container">
            <button onClick={() => this.callPeer()}><i className="material-icons">videocam</i></button>
            <div className="play-pause">
              <div role="presentation" onClick={() => this.resumeCall()}><i className="material-icons">play_arrow</i></div>
              <div role="presentation" onClick={() => this.pauseCall()}><i className="material-icons">pause</i></div>
            </div>
            <button onClick={() => this.endCall()}><i className="material-icons">close</i></button>
          </div>
        </div>
        <div className="message-container">
          <div className="message-topbar">
            <button onClick={() => this.saveChat()}><SimpleModal /></button>
            <LanguageSelector
              selectLanguage={e => this.selectLanguage(e)}
              translateFrom={this.state.translateFrom}
              translateTo={this.state.translateTo}
            />
          </div>
          <div className="chat-window">
            <p className={this.state.displayStatus}><strong>{this.state.otherUser}</strong>{ ' has joined the conference'}</p>
            <div className="output">
              {this.state.messages.map((data, i) => {
                return (<TextToTranslate
                  handle={data.handle}
                  message={data.message}
                  translateFrom={this.state.translateFrom}
                  translateTo={this.state.translateTo}
                  setColor={username => this.setColor(username)}
                  key={i}
                />);
              })}
            </div>
            <div className="feedback">{this.state.feedback}</div>
          </div>
          <div className="message-send">
            <input
              className="message"
              type="text"
              placeholder="Message"
              value={this.state.message}
              onChange={e => this.setText(e)}
              onKeyPress={this.ifEnter(() => this.sendChat())}
            />
            <button id="send" onClick={() => this.sendChat()}><i className="material-icons">send</i></button>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
