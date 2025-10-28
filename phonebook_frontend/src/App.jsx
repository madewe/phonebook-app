import { useState, useEffect } from 'react'
import axiosService from './services/services'


const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newSearchName, setNewSearchName] = useState('');
  const [newErrorMessage, setNewErrorMessage] = useState(null);
  const [newStatusMessage, setNewStatusMessage] = useState(null);

  useEffect(() => {
    axiosService
      .getAll()
      .then(data =>{
        setPersons(data)
      })
  }, [])

  const addName = (event) => {
    event.preventDefault();

    if(newName === '' || newNumber === '' ){
      setNewErrorMessage(`Please insert name AND number`);
      setTimeout(() => {
        setNewErrorMessage(null)
      }, 2000);
      return;
    }
    
    else if(/^\d+([-\s]?\d+)*$/.test(newNumber)){

      let nameObject = persons.find(p => p.name.toLowerCase() === newName.toLowerCase().trim());

      if(nameObject){
        setNewErrorMessage('this name already exists in phonebook');
        setTimeout(() => {
          if(window.confirm(`${nameObject.name} is already added to phonebook, replace the old number ${nameObject.number} with the new one?`)){
            handleNumberUpdate({...nameObject, number: newNumber});
          };
          setNewErrorMessage(null);
        }, 100);
        
        setNewName('');
        setNewNumber('');
        return;  
      }  
      else{
        nameObject = {
          name: newName.trim(), 
          id: String(persons.length+1), 
          number: newNumber
        }

        axiosService
          .create(nameObject)
          .then(data => {
            setNewStatusMessage(`${data.name} successfully added!`);
            setTimeout(() => {
              setNewStatusMessage(null)
            }, 2000);
            setPersons(persons.concat(data));
            setNewName('');
            setNewNumber('');
          })
          .catch(error => {
            setNewErrorMessage(`${nameObject.name} couldn't be added. Error status code: ${error.response.status}`);
            console.log(`Error: ${error}`);
          })
        setTimeout(() => {
          setNewErrorMessage(null);
          setNewStatusMessage(null);
          }, 2000); 
      }
      
    }
    else{
      setNewErrorMessage('Input must consist of numbers only. A single space or hyphen is permitted between numbers, but not at the beginning or end.');
      /*window.alert("only numbers allowed, between numbers only one space ( ) or one minus (-) allowed\nPlease no space or minus at the end or beginning");*/
      return;
    }
  }

  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  }

  const handleDelete = (id) => {
    const personToDelete = persons.find(p => p.id === id);
    //if(window.confirm(`Delete ${persons.find(p => p.id === id).name} ?`)){
    if(window.confirm(`Delete ${personToDelete.name} ?`)){
      axiosService.erase(id)
        .then(status => {
          console.log(`Statuscode: ${status}`);
          console.log("statustyp: ", typeof status);
          console.log("Test: ", axiosService.erase.toString());
          setNewStatusMessage(status === 200 ? `Information of ${personToDelete.name} was sucessfully removed from phonebook` : null)
          console.log(newStatusMessage);
        })
        .catch(error => {
          setNewErrorMessage(error.response?.status === 404 ? `Information of ${personToDelete.name} has already been removed from phonebook` : 
            (error.response?.status ? error.response.statusText : null));
          console.log(`Error: ${error}`);
          
        })
      setTimeout(() => {
        setNewErrorMessage(null);
        setNewStatusMessage(null);
        }, 2000); 
      setPersons(persons.filter(p => p.id !== id));
    }
  }

  const handleNumberUpdate = (personToUpdate) => {
    axiosService
      .update(personToUpdate.id, personToUpdate)
      .then(data => {
        setNewStatusMessage(`Number of ${personToUpdate.name} was successfully updated!`);
        setTimeout(() => {
          setNewStatusMessage(null);
        }, 2000);
        setPersons(persons.map(p => p.id === data.id ? data : p))
      })
      .catch(error => {

        setNewErrorMessage(error.response?.status === 404 ? `Update failed, Information of ${personToUpdate.name} has already been removed from phonebook` : 
            (error.response?.status ? `Something went wrong, update failed, Error-Code: ${error.response.status} (${error.response.statusText})` : null));
          console.log(`Error: ${error}`);
          setTimeout(() => {
          setNewErrorMessage(null);
        }, 2000);
        setPersons(persons.filter(p => p.id !== personToUpdate.id));
      })
      
  }

  const handleNumberChange = (event) => {
    const regex = /^(\d+[-\s]?)*$/;
    console.log(event.target.value);
    if(regex.test(event.target.value)){
      setNewNumber(event.target.value);
    }
    else{
      window.alert("only numbers allowed, between numbers one space ( ) or minus (-) allowed\nPlease no space or minus at the end or beginning");
    }
  }

  const handleSearchChange = (event) => {
    console.log(event.target.value);
    setNewSearchName(event.target.value);
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <NotificationError message={newErrorMessage} />
      <NotificationStatus message={newStatusMessage} />
      
      <AddForm 
        bezeichnung="add a new person" 
        onSubmit={addName} 
        inputs={[
          {bezeichnung: "name", value: newName, onChange: handleNameChange}, 
          {bezeichnung: "number", value: newNumber, onChange: handleNumberChange}]} 
          debugName={newName} 
          debugNumber={newNumber}/>
      <h2>People and Numbers</h2>
      <Filter value={newSearchName} onChange={handleSearchChange} />
      <AllPersons listToRender={persons} filterTerm={newSearchName} deletePerson={handleDelete}/>
    </div>
  )
}
export default App

const Person = (props) => {
  return(
    <>
      {props.name} {props.number}<br/>
    </>
  )
}

const AllPersons = (props) => {
  return(
    <div>
        {props.listToRender.filter(element => 
          element.name
            .toLowerCase()
            .includes(props.filterTerm
            .toLowerCase()))
            .map((element, index) => 
          <div key={index} style={{display: 'flex', gap: '1.0rem'}}>
            <Person name={element.name} number={element.number} /> <Button type="button" bezeichnung="delete" onClick={() => props.deletePerson(element.id)}/>
          </div>)}
      </div>
  )
}

const Filter = (props) => {
  return(
    <div>
      <p>
        filter with <input value={props.value} onChange={props.onChange} />
      </p>
    </div>
  )
}

const AddForm = (props) => {
  return(
    <>
    <h2>{props.bezeichnung}</h2>
      <form onSubmit={props.onSubmit}>
        <Input bezeichnung={props.inputs[0].bezeichnung} value={props.inputs[0].value} onChange={props.inputs[0].onChange} />
        <Input bezeichnung={props.inputs[1].bezeichnung} value={props.inputs[1].value} onChange={props.inputs[1].onChange} />
        <Button type="submit" bezeichnung="add" />
        {/*
        <Debug bezeichnung="debug name" value={props.debugName} />
        <Debug bezeichnung="debug number" value={props.debugNumber} />
        */}
      </form>
    </>
  )
}

const Input = (props) => {
  return(
    <>
      <div>
        {props.bezeichnung}: <input value={props.value} onChange={props.onChange} />
      </div>
    </>
  )
}

const Button = (props) => {
  return(
    <div>
      <button type={props.type} onClick={props.onClick}>{props.bezeichnung}</button>
    </div>
  )
}

const Debug = (props) => {
  return(
    <div>{props.bezeichnung}: {props.value}</div>
  )
}

const NotificationError = ({message}) => {
  if(message === null){
    return null
  }
  return (
    <div className='error'>
      <Notification message={message} />
    </div>
  )
}

const NotificationStatus = ({message}) => {
  if(message === null){
    return null
  }
  return (
    <div className='status'>
      <Notification message={message} />
    </div>
  )
}

const Notification = ({message}) => {  
  return (
    <div>
      {message}
    </div>
  )
}
