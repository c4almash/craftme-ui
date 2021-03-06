import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import { getChatFromLesson } from '../apiCaller.js';

export default class Card extends Component {
  constructor(props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
  }

  async clickHandler() {
    // parent component ( LessonsContainer ) reaction to the click
    const { reactToClick } = this.props;

    // upcoming lessons case
    // redirect to conference
    if (this.props.booking) {
      const { booking } = this.props;
      // at this case ( upcoming lessons ) redirect to conference and pass booking
      this.props.history.push('/conference', { booking });
    } // past lessons case
    // render chats and chatlog
    else if (this.props.pastLesson) {
      try {
        const { chat_id } = this.props.pastLesson;
        const { messages } = await getChatFromLesson(chat_id);
        reactToClick(messages);
      } catch (error) {
        console.error('Error with rendering pastLessons', error);
      }
    }
    // search results case
    // render teachers for a specific craft
    else if (this.props.teacher) {
      const { teacher, student, matchedCraft } = this.props;
      this.props.history.push('/calendar', { teacher, student, matchedCraft });
    }
  }


  render() {
    const {
      booking, pastLesson, buttonName, teacher,
    } = this.props;
    return (
      <Paper className="card">
        <img src="" alt="" />
        <h3 className="title">
          {
          (booking && booking.title) ||
          (pastLesson && pastLesson.title) ||
          (teacher && teacher.username) ||
          'no title'
        }
        </h3>
        <p> { (pastLesson && pastLesson.notes) || (teacher && teacher.bio) } </p>
        <button className="card-button" type="button" onClick={this.clickHandler}>{buttonName}</button>
      </Paper>
    );
  }
}
