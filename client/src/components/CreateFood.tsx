import * as React from 'react'
import { Form, Button, Header, Modal, Image, Input, InputOnChangeData, Dropdown, DropdownProps, Grid, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile, createFood, patchFoods } from '../api/food.service'
import { ChangeEvent } from 'react'
import { Food } from '../types/Food'
import { getIngredients } from '../api/ingredient.service'
import { Ingredient } from '../types/Ingredient'

enum UploadState {
    NoUpload,
    FetchingPresignedUrl,
    UploadingFile,
}

interface CreateFoodProps {
    auth: Auth
    open: boolean
    editFood: Food,
    oncloseModal: Function,
}

interface IngredientOptions {
    Key: string,
    text: string,
    value: string,
}

interface CreateFoodState {
    name: string,
    file: any,
    uploadState: UploadState,
    open: boolean,
    attachmentUrl?: string,
    ingredients: Ingredient[],
    loading: boolean,
    ingredientOptions: IngredientOptions[],
    selectedIngredients: string[],
}

export class CreateFood extends React.PureComponent<
    CreateFoodProps,
    CreateFoodState
    > {
    state: CreateFoodState = {
        name: '',
        file: undefined,
        uploadState: UploadState.NoUpload,
        open: this.props.open,
        attachmentUrl: this.props.editFood.attachmentUrl,
        ingredients: [],
        loading: true,
        ingredientOptions: [],
        selectedIngredients: [],
    }

    constructor(props: CreateFoodProps) {
        super(props);
        this.setState({
            name: '',
            file: undefined,
            uploadState: UploadState.NoUpload,
            open: this.props.open,
            attachmentUrl: this.props.editFood.attachmentUrl,
        })
    }

    async componentDidUpdate(prevProps: CreateFoodProps) {

        if (prevProps.open !== this.props.open) {
            this.setState({
                open: this.props.open,
                name: this.props.editFood.name,
                attachmentUrl: this.props.editFood.attachmentUrl,
            });

            if(this.props.open) {
                try {
                    const ingredients = await getIngredients(this.props.auth.getIdToken())
                    this.setState({
                      ...this.state,
                      ingredients,
                    })

                    const ingredientOptions = ingredients.map( ingredient => ({
                        Key: ingredient.itemId,
                        text: ingredient.name,
                        value: ingredient.itemId,
                    }))
                    const selectedIngredients = ingredientOptions.map( option=>option.value) as string[]
                    this.setState({
                        ingredientOptions,
                        selectedIngredients,
                    })
                  } catch (e) {
                    alert(`Failed to fetch ingredients: ${e.message}`)
                  }
              
                  this.setState({
                    ...this.state,
                    loading: false
                  })
            }
           
        }
    }

    handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files) return

        this.setState({
            ...this.state,
            file: files[0]
        })
    }

    handleSubmit = async (event: React.SyntheticEvent) => {
        event.preventDefault()

        try {

            let newFood;

            if(this.props.editFood.itemId) {
                newFood = await patchFoods(this.props.auth.getIdToken(), this.props.editFood.itemId, {
                    name: this.state.name,
                    ingredientItemIds: this.state.selectedIngredients
                }); 
            } else {
                newFood = await createFood(this.props.auth.getIdToken(), {
                    name: this.state.name,
                    ingredientItemIds: this.state.selectedIngredients,
                });

                if (!this.state.file) {
                    alert('File should be selected')
                    return
                }
            }

            this.setUploadState(UploadState.FetchingPresignedUrl)

            console.log(this.props);
            const uploadURLData = {
                contentType: this.state.file.type,
                fileName: this.state.file.name,
            };

            console.log(this.state);

            const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newFood.itemId, uploadURLData)

            this.setUploadState(UploadState.UploadingFile)
            await uploadFile(uploadUrl, this.state.file, this.state.file.type)

            this.setState({open:false})
            this.props.oncloseModal()
            alert('File was uploaded!')
        } catch (e) {
            alert('Could not upload a file: ' + e.message)
        } finally {
            this.setUploadState(UploadState.NoUpload)
        }
    }

    setUploadState(uploadState: UploadState) {
        this.setState({
            ...this.state,
            uploadState
        })
    }

    onClose() {
        this.state.open = false
    }

    onOpen() {
        this.state.open = true
    }

    closeModal = (event: React.SyntheticEvent) => {
        event.preventDefault()
        this.setState({open:false})
        this.props.oncloseModal()
    }

    handleChange = (e: ChangeEvent<HTMLInputElement>, val: InputOnChangeData) => this.setState({ name: val.value })

    // handleSelectionChange = (e: ChangeEvent<HTMLInputElement>, val: InputOnChangeData) => this.setState({ foodName: val.value })
    handleSelectionChange = (e: React.SyntheticEvent<HTMLElement, Event>, data: DropdownProps) => {
        console.log(data)
        if( data.value ) {
            this.setState({
                ...this.state,
                selectedIngredients: data.value as string[],
            })
        }   
    }

    render() {

        if ( !this.state.open ) {
            return null;
        }

        if( this.state.loading) {
            return this.renderLoading()
        }
        return (

            <Modal
                onClose={() => this.onClose()}
                onOpen={() => this.onOpen()}
                open={this.state.open}
            >
                <Modal.Header>Select a Photo</Modal.Header>
                <Modal.Content image>
                    <Image size='medium' src={this.state.attachmentUrl ? this.state.attachmentUrl : 'https://react.semantic-ui.com/images/avatar/large/rachel.png'} wrapped />
                    <Modal.Description>
                        <Header> Food Image</Header>
                        <Form onSubmit={this.handleSubmit}>

                            <Form.Field>
                                <label>Name</label>
                                <Input
                                    type="text"
                                    placeholder="Food Name"
                                    onChange={this.handleChange}
                                    value={this.state.name}
                                />
                            </Form.Field>

                            <Form.Field>
                                <Dropdown placeholder='Ingredients' fluid multiple selection options={this.state.ingredientOptions} onChange={this.handleSelectionChange} value={this.state.selectedIngredients}/>
                            </Form.Field>

                            <Form.Field>
                                <label>File</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    placeholder="Image to upload"
                                    onChange={this.handleFileChange}
                                />
                            </Form.Field>

                            <Form.Field>
                                <Button type='submit'>Submit</Button>
                            </Form.Field>

                            <Button color='black' onClick={this.closeModal}>Nope</Button>
                        </Form>
                    </Modal.Description>
                </Modal.Content>
                <Modal.Actions>

                </Modal.Actions>
            </Modal>

        )
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

    renderButton() {

        return (
            <div>
                {this.state.uploadState === UploadState.UploadingFile && <p>Creating Food</p>}
                <Button
                    loading={this.state.uploadState !== UploadState.NoUpload}
                    type="submit"
                >
                    Upload
                </Button>
                
            </div>
        )
    }
}
