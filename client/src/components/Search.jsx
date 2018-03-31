import React from 'react';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import TextField from 'material-ui/TextField';
import Paper from 'material-ui/Paper';
import { MenuItem } from 'material-ui/Menu';
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import styled from 'styled-components';
/* import Button from 'material-ui/Button'; */

const StyledDiv = styled.div`
margin-left: 40%;
margin-right: 40%;
`;

let suggestions = [];

function renderInput(inputProps) {
  const { classes, ref, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: ref,
        ...other,
      }}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  const matches = match(suggestion.label, query);
  const parts = parse(suggestion.label, matches);

  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {parts.map((part, index) => {
          return part.highlight ? (
            <span key={String(index)} style={{ fontWeight: 300 }}>
              {part.text}
            </span>
          ) : (
              <strong key={String(index)} style={{ fontWeight: 500 }}>
                {part.text}
              </strong>
            );
        })}
      </div>
    </MenuItem>
  );
}

function renderSuggestionsContainer(options) {
  const { containerProps, children } = options;

  return (
    <Paper {...containerProps} square>
      {children}
    </Paper>
  );
}

function getSuggestionValue(suggestion) {
  return suggestion.label;
}

function getSuggestions(value) {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;
  let count = 0;

  return inputLength === 0
    ? []
    : suggestions.filter(suggestion => {
      const keep =
        count < 5 && suggestion.label.toLowerCase().slice(0, inputLength) === inputValue;

      if (keep) {
        count += 1;
      }

      return keep;
    });
}

const styles = theme => ({
  container: {
    flexGrow: 1,
    position: 'relative',
    height: 250,
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  suggestion: {
    display: 'block',
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none',
  },
});

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      suggestions: [],
    };
    this.search = async () => {
      try {
        const data = await axios.get(`${process.env.REST_PATH}/user/getAllCrafts`);
        if (data) {
          let newPull = [];
          for (var element of data.data) {
            newPull.push({ label: element.name, craft: element })
          }
          suggestions = newPull;
        }
      } catch (error) {
        console.log('error with search data:', error);
      }
    };
    this.handleSuggestionsFetchRequested = this.handleSuggestionsFetchRequested.bind(this);
    this.handleSuggestionsClearRequested = this.handleSuggestionsClearRequested.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleKey = this.handleKey.bind(this);
  }
  componentDidMount() {
    this.search();
  }

  handleSuggestionsFetchRequested({ value }) {
    this.setState({
      suggestions: getSuggestions(value),
    });
  }

  handleSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  handleChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  handleKey(event) {
    if (event.key == 'Enter') {
      // the only part written by fireArthur
      //find a match in the crafts array
      const matchedCraftIndex = suggestions.findIndex((craftSuggestion) => {
        return craftSuggestion.label === this.state.value;
      });
      // if match not found
      if (matchedCraftIndex < 0) {
        console.error(`match not found for ${this.state.value}`);
      } else {
        // redirect to searchResults and pass the matched craft
        const matchedCraft = suggestions[matchedCraftIndex].craft;
        this.props.history.push('/searchResults', { matchedCraft });
      }

    }
  }


  render() {
    const { classes } = this.props;
    return (
      <div>
        <StyledDiv >
          <Grid container spacing={40}>
            <Grid item xs={6} sm={3}>
            </Grid>
            <h1>CraftMe</h1>
            <img src="logo.png" alt="logo" height="300" width="303" />
            <Grid item xs={12}>

              <Autosuggest
                theme={{
                  container: classes.container,
                  suggestionsContainerOpen: classes.suggestionsContainerOpen,
                  suggestionsList: classes.suggestionsList,
                  suggestion: classes.suggestion,
                }}
                renderInputComponent={renderInput}
                suggestions={this.state.suggestions}
                onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
                onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
                renderSuggestionsContainer={renderSuggestionsContainer}
                getSuggestionValue={getSuggestionValue}
                renderSuggestion={renderSuggestion}
                inputProps={{
                  classes,
                  placeholder: 'Search a Skill',
                  value: this.state.value,
                  onChange: this.handleChange,
                  onKeyPress: this.handleKey,
                }}
              />

            </Grid>
          </Grid>
        </StyledDiv>
      </div>

    );
  }
}

export default withStyles(styles)(Search);
