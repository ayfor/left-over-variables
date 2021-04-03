var dataTableHandle;
var selectedGroceries = [];
var requestUrl;
$(document).ready( function () {
    // initialize the datatable
    dataTableHandle = $('#grocList').DataTable({
        "columnDefs": [
            //disabel sorting for the remove and checkbox column
            { "orderable": false, "targets": [0,3] },
            //add class to center remove and checkbox column
            { "className": "text_align_center", "targets": [ 0,3 ] }
        ]
    });
    //Call the fillList function to populate the datatable from local storage
    fillList();
    //Initialize the modal window (New Item Window)
    $('.modal').modal();  

} );

//Array for storing current grocery entries
var groceryItemArray = [];

//Variables for grocery table
var groceryTableListElement = $("#grocery-table")

//Varaibles for "New Item" button
var newItemButtonElement = $("#new-item-button");
var newItemFormElement = $('#new-item-modal');

//Variables for modal 
var groceryItemInputElement = $('#grocery-item-input');
var expirationDateInputElement = $('#expiration-date-input');  
var submitGroceryItemElement = $('#submit-grocery-item');


//Test button used to fetch sample data from the API
var generateRecipesButton = $('#generate-recipes-button');

var recipeListElement = $('#recipe-list');

//Function for adding a new grocery item
function addGroceryItem(event) { 

    //Create new item to store inputted values
    let newItem = {
        "label":'',
        "expirationDate":'',
        "id":''
    }

    //Add inputs from modal fields    
    newItem.label = groceryItemInputElement.val();
    newItem.expirationDate = expirationDateInputElement.val();
    
    //Get unix code momentjs
    let newId = moment().format('X');
    newItem.id = newId;

    //Reset input values
    groceryItemInputElement.val('');
    expirationDateInputElement.val('');

    //Add new item to array
    groceryItemArray.push(newItem);

    //Add row to table
    addRow(newItem);
    
    //Add items to local storage
    localStorage.setItem("groceryItemArray", JSON.stringify(groceryItemArray));

}

function addRow(newItem) {
    //creating the remove button elements of the row
    let newButton = $(document.createElement('td'))
    let newLabel = $(document.createElement('td'))
    let aTag = $(document.createElement('a'));
    let iTag = $(document.createElement('i'));
    //create the checkbox for selecting ingrediants
    let checkboxLabel = $(document.createElement('label'))
    let checkboxInput = $(document.createElement('input')).addClass("grocCheckbox");
    let emptySpan = $(document.createElement('span'));
    checkboxInput.attr({
        "id":"check_"+newItem.id,
        "data-groceryname":newItem.label,
        "checked":"checked",
        "type":"checkbox"
    });
    checkboxLabel.append(checkboxInput,emptySpan);
    newLabel.append(checkboxLabel);
    
    //setting button attributes
    aTag.addClass('delete_grocery');
    aTag.attr('href','#');
    aTag.attr('data-id', newItem.id);
    iTag.addClass('far fa-window-close fa-w-16 fa-2x');
    
    // Assemble tags
    aTag.append(iTag);
    newButton.append(aTag);
   
    // push the new label to the array of selected groceries
    selectedGroceries.push(newItem.label);
    //set a handle for the new row, added the .html() to the generated button tag, .node() to create a node of the row
    var newRow = dataTableHandle.row.add([newLabel.html(),newItem.label, newItem.expirationDate, newButton.html()]).draw().node();

    // adding the id to the generated tr element
    $(newRow).attr('id','item_' + newItem.id);
}




//create function to fill data table
 function fillList () {
    var storedFood = JSON.parse(localStorage.getItem('groceryItemArray'));
    if(storedFood){
        for (var i =0; i < storedFood.length; i++){
            newItem = storedFood[i];
            addRow(newItem);
            groceryItemArray.push(newItem);
        }   
    }
  }

// helper function to handle removal of the item from the selelcted list when checkmark is unchecked and the button to remove the item is pressed
function removeFromSelectedList(object){
    //itterate over not just last seen but the entire array in case grocery is repeated
    for( var i = 0; i < selectedGroceries.length; i++){ 
        //using splice to remove the objects based on the grocery name from the selectedGroceries array
        if ( selectedGroceries[i] === object.data("groceryname")) { 
            selectedGroceries.splice(i, 1); 
          i--; 
        }}
    console.log(selectedGroceries);
}


//handle check and uncheck select checkbox events
$("body").on('click',".grocCheckbox", function(){
    //on change if this checkbox is checked
    if ($(this).is(':checked')){
        //add the item to the array of selectedGroceries
        selectedGroceries.push($(this).data("groceryname"));
        console.log(selectedGroceries);
    }else{
        // remove item from the array of selectedGroceries
        removeFromSelectedList($(this));
    }
});

function createRecipeCards(recipes) {
    //First, reset html content 
    recipeListElement.html('');

    recipes.forEach(element => {
        let recipeCard = createRecipeCard(element.recipe);
    });    
}

function createRecipeCard(recipe) {
    //Get ingredients
    let ingredientsArray = [];
    
    recipe.ingredients.forEach(element => {
        ingredientsArray.push(element.text);
    });

    let ingredientList = $(document.createElement('ul'));

    ingredientsArray.forEach(element => {
        let ingredientItem =  $(document.createElement("li"));

        ingredientItem.text(element);

        ingredientList.append(ingredientItem);
        
    });

    console.log(ingredientList)

    //Create html element
    let recipeCard = $('<div class="col s12 m7"><div class="card horizontal"><div class="card-image"><img src="'+recipe.image+'"></div><div class="card-stacked"><div class="card-content"><h5>'+recipe.label+'</h5><p>Servings: '+recipe.yield+'</p>Ingredients:<div class="recipe_ingredient_list"> '+ingredientList.html()+'</div></div><div class="card-link"><a href="'+recipe.url+'" target="_blank" style="color: slateblue"><i class="material-icons">link</i><span>View Recipe</span></a></div></div></div></div></div>)');

    //Optional Calories Display: <p>Calories: '+Math.floor(recipe.calories)+'</p>
    

    //Append to the current recipe list
    recipeListElement.append(recipeCard)
}



//Event handling for "Submit" button in New Item menu
submitGroceryItemElement.click(addGroceryItem);

generateRecipesButton.click(function (params) {
    //finaly set the requestUrl with the new selected options
    console.log(selectedGroceries);
    requestUrl = 'https://api.edamam.com/search?q='+selectedGroceries.join("+")+'&app_id=03d33e60&app_key=82cdeff85835203474becaab930c556c&from=0&to=5&calories=591-722&health=alcohol-free'; 
    
    fetch(requestUrl, {
        // The browser fetches the resource from the remote server without first looking in the cache.
        // The browser will then update the cache with the downloaded resource.
        cache: 'reload',
        })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            createRecipeCards(data.hits);
    });
});

//Event delegation for removing rows from the data table
$('#grocList').on('click', ".delete_grocery", function(){
    //Get Id from selected element by accessing the data attribute
    let removeId = $(this).data('id');

    // first remove item from the selected List
    removeFromSelectedList($("#check_"+removeId))

    //-----Delete row from data table-----
    dataTableHandle.row($(this).parents('tr')).remove().draw();

    //-----Delete entry from current grocery item array-----


    //Check for item with matching id in the current grocery array, remove if id matches the id of the clicked row element
    for (let index = 0; index < groceryItemArray.length; index++) {
        const element = groceryItemArray[index];

        //Check if id's match
        if(+element.id === removeId){
            //Remove using splice method             
            groceryItemArray.splice(index,1)
        }
    }
    // remove this item from the grocery list
    
    
    //-----Update local storage-----
    localStorage.setItem("groceryItemArray", JSON.stringify(groceryItemArray));

})







