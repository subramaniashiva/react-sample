var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return {__html: rawMarkup};
  },
  render: function() {
    return (
      <div className='comment'>
        <h2 className='commentAuthor'>
          {this.props.author}
        </h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});
var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>{comment.text}</Comment>
        )
    });
    return (
      <div className='commentList'>
        {commentNodes}
      </div>
    );
  }
});
var CommentForm = React.createClass({
  getInitialState: function() {
    return {
      author: '',
      text: ''
    };
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleFormSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();

    if(!author || !text) {
      return;
    }
    this.props.onCommentSubmit({author: author, text:text});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className='commentForm' onSubmit={this.handleFormSubmit}>
        <input type='text' value={this.state.author} placeholder='Enter your name' onChange={this.handleAuthorChange}/>
        <input type='text' value={this.state.text} placeholder='Enter your comment' onChange={this.handleTextChange}/>
        <input type='submit' value='Post' />
      </form>
    );
  }
});
var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }
    });
  },
  getInitialState: function() {
      return {
          data: []  
      };
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      type: 'POST',
      dataType: 'json',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.log(this.props.url, status, err.toString());
        this.setState({data: comments});
      }.bind(this)
    });
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render: function() {
    return (
      <div className='commentBox'>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
      </div>
    );
  }
});
ReactDOM.render(<CommentBox url='/api/comments' pollInterval='2000'/> ,
  document.getElementById('content')
);
