import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createIngredient, deleteIngredient, getIngredients, patchIngredient } from '../api/ingredient.service'
import Auth from '../auth/Auth'
import { Ingredient } from '../types/Ingredient'
import { CreateIngredient } from './CreateIngredient'

interface IngredientProps {
  auth: Auth
  history: History
}

interface IngredientState {
  ingredients: Ingredient[]
  newIngredientName: string
  loadingIngredients: boolean
  showCreateModal: boolean
  editIngredient: Ingredient
}

export class Ingredients extends React.PureComponent<IngredientProps, IngredientState> {
  state: IngredientState = {
    ingredients: [],
    newIngredientName: '',
    loadingIngredients: true,
    showCreateModal: false,
    editIngredient: {
      itemId: '',
      ingredientId: '',
      name: '',
    } ,
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newIngredientName: event.target.value })
  }

  onEditButtonClick = (ingredient: Ingredient) => {
    this.setState({
      showCreateModal: true,
      editIngredient: ingredient,
    })
  }

  handleCreateClick = () => {
    this.setState({
      showCreateModal: true,
    })
  }

  onIngredientDelete = async (itemId: string) => {
    try {
      await deleteIngredient(this.props.auth.getIdToken(), itemId)
      this.setState({
        ingredients: this.state.ingredients.filter(ingredient => ingredient.itemId != itemId)
      })
    } catch {
      alert('Ingredient deletion failed')
    } 
  }

  async componentDidMount() {
    try {
      await this.loadIngredients()
    } catch (e) {
      alert(`Failed to fetch ingredients: ${e.message}`)
    }
  }

  async loadIngredients () {
    const ingredients = await getIngredients(this.props.auth.getIdToken())
      this.setState({
        ingredients,
        loadingIngredients: false
      })
  }

  oncloseModal = async () => {
    this.setState({
      showCreateModal: false
    })
    await this.loadIngredients()
  }

  render() {
    return (
      <div>
        <Header as="h1">Ingredients</Header>
            <CreateIngredient auth={this.props.auth} open={this.state.showCreateModal} oncloseModal={this.oncloseModal} editIngredient={this.state.editIngredient}></CreateIngredient>
        {this.renderCreateIngredientInput()}
        {this.renderIngredients()}
      </div>
    )
  }

  renderCreateIngredientInput() {
    return (
      <Grid.Row>
        <Grid.Column width={2}>
        <Button
            content='Create Ingredient'
            onClick={this.handleCreateClick}
          />
        </Grid.Column>
        <Grid.Column width={14}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderIngredients() {
    if (this.state.loadingIngredients) {
      return this.renderLoading()
    }

    return this.renderIngredientList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Ingredients
        </Loader>
      </Grid.Row>
    )
  }

  renderIngredientList() {
    return (
      <Grid padded>
        {this.state.ingredients.map((ingredient, pos) => {
          return (
            <Grid.Row key={ingredient.itemId}>

              <Grid.Column width={10} verticalAlign="middle">
                {ingredient.name}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(ingredient)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onIngredientDelete(ingredient.itemId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {ingredient.attachmentUrl && (
                <Image src={ingredient.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
