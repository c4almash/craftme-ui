import React, { Component } from 'react';
import axios from 'axios';

class ConversationList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      conversation: []
    };
    this.grabConversations = this.grabConversations.bind(this);
  }

  async grabConversations(e) {
    try {
      let id = parseInt(e.target.getAttribute('data-id'));
      let conversations = await axios.get(
        `http://localhost:3000/user/messages/fetchAllMessagesByConversationId/${id}`
      );
      this.setState({ conversation: conversations.data });
    } catch (error) {
      console.log('Error with grabConversations', error);
      return;
    }
  }

  componentDidMount() {}

  render() {
    return (
      <div>
        {this.props.conversations.map(conversation => {
          return (
            <div
              data-id={conversation.id}
              onClick={e => this.grabConversations(e)}
            >
              View your conversation with:
              {conversation.sender}
            </div>
          );
        })}
        <br />
        <div>
          {this.state.conversation
            ? this.state.conversation.map(conv => {
                return (
                  <div>
                    {conv.sender} : {conv.text}
                  </div>
                );
              })
            : null}
        </div>
      </div>
    );
  }
}

export default ConversationList;
