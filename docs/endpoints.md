# Endpoints `/api`

## Persons `/person`

| Endpoint | Description |
| :- | :- |
| GET `/` | Returns an `array` of all person objects <br/> Returns `200` - Everything fine |
| GET `/:id` |Returns the person object with id `:id` |
| GET `/:id/visits` | Returns an `array` of all visit objects for a the person with id `:id` |
| PUT `/:id` | Updates the person object with id `:id` |
| DELETE `/:id` | Deletes the person object with id `:id` |


## Businesses `/business`

| Endpoint | Description |
| :- | :- |
| GET `/` | Returns an `array` of all business objects <br/><br/> Returns `200` - Everything fine |
| POST `/` | Creates a business object <br/><br/>Returns: <br/>`id` of created business <br/>`200` - Everything fine <br/>`400` - Bad Request |
| GET `/:id` | Returns a business object with id `:id` |
| GET `/:id/locations` | Returns an `array` of all location objects for a the business with id `:id` |
| PUT `/:id` | Updates the business object with id `:id` |
| DELETE `/:id` | Deletes the business object with id `:id` |

## Locations `/location`

| Endpoint | Description |
| :- | :- |
| GET `/` |Returns an `array` of all location objects <br/> Returns `200` - Everything fine |
| POST `/` | Creates a location object <br/><br/> Returns <br/>`id` of created location <br/>`200` - Everything fine <br/>`400` - Bad Request|
| GET `/:id` | Returns a location object with id `:id`
| GET `/:id/visits` | Returns an `array` of all visit objects for a the location with id `:id`
| GET `/:id/visits/current` | Returns an `array` of all **current** visit objects for a the location with id `:id`
| PUT `/:id` |Updates the location object with id `:id`
| DELETE `/:id`| Deletes the location object with id `:id`
| GET `/search/:term` | Returns an `array` of location objects which are matching the searchterm `:term`
| GET `/gps/:coordinates/radius/:radius` | Returns an `array` of location objects around the `:coordinates` within a radius of `:radius`


## Categories `/category`

| Endpoint | Description |
| :- | :- |
| GET `/` | Returns an `array` of all category objects <br/><br/>Returns`200` - Everything fine
| POST `/` | Creates a category object<br/><br/> Returns<br/>`id` of created category<br/>`200` - Everything fine<br/>`400` - Bad Request
| GET `/:id` |Returns a category object with id `:id`
| PUT `/:id` | Updates the category object with id `:id`
| DELETE `/:id` | Deletes the category object with id `:id`

## Authentication `/auth`

### POST `/login`
Login a user

#### Body
```json
{
  "email":"xyz@mail.de",
  "password":"123456"
}
```
#### Returns
`200` - Everything fine
`401` - Unauthorized

### POST `/register`
Register a user

#### Body
```json
{
  "email":"xyz@mail.de",
  "password":"123456",
  "name":"Mustermann",
  "firstname":"Max",
  "phone":"0123456789",
  "address":{
    "street":"Entenhauser Straße",
    "number":"12",
    "additional":"Apartment 2",
    "postcode":"12345",
    "city":"Entenhausen"
  }
}
```
#### Returns
`200` - Everything fine
`400` - Bad Request
