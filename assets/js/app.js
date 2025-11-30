
const cl = console.log;


const blogForm = document.getElementById("blogForm")
const titleControl = document.getElementById("title")
const contentControl = document.getElementById("content")
const userIdControl = document.getElementById("userId")
const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const postContainer = document.getElementById("postContainer")

let BASE_URL = `https://post-blog-dc2b4-default-rtdb.firebaseio.com`;

let BLOG_URL = `${BASE_URL}/blogs.json`;

function toggleSpinner (flag){
	
	if(flag){
		loader.classList.remove('d-none')
	}else{
		loader.classList.add('d-none')
	}
}

function snackBar(title,icon){
      Swal.fire({
		  title,
		  icon,
		  timer:1000
	  })
}

const createCards = arr =>{
	let result = arr.map(post=>{
		return `
		    <div class="card mb-4 shadow rounded"  id="${post.id}">
				<div class="card-header">
					<h3 class="m-0 text-capitalize">${post.title}</h3>
				</div>
				<div class="card-body">
					<p class="m-0">
					 ${post.content}
					</p>
				</div>
				<div class="card-footer d-flex justify-content-between">
					<button class="btn btn-sm btn-outline-primary" onclick = "onEdit(this)">Edit</button>
					<button class="btn btn-sm btn-outline-danger" onclick = "onRemove(this)">Remove</button>
				</div>
		      </div>`
	}).join("")
	postContainer.innerHTML = result;
}

function blogObjToArr(obj){
	let blogArr = [];
	
	for(const key in obj){
		obj[key].id = key
		blogArr.push(obj[key])
	}
	return blogArr;
}

const makeApiCall = (apiUrl, methodName, msgBody)=>{
	toggleSpinner(true)
	if(!apiUrl && apiUrl == ''){
		throw new Error(`Api url is missing`)
	}
	
	msgBody = msgBody ? JSON.stringify(msgBody): null;
	
	return fetch(apiUrl,{
		method: methodName,
		body: msgBody,
		headers:{
			Auth: 'Token From LS',
			'content-type':'application/json'
		}
	})
	.then(res=>{
		return res.json().then(data=>{
			if(!res.ok){
				let err = data.error || res.statusText || `Network Error`;
				throw new Error(err)
			}
			return data;
		})
	})
	.finally(()=>{
	   toggleSpinner(false)
	})
}

function fetchAllBlogs(){
	
	makeApiCall(BLOG_URL, 'GET', null)
	 .then(data=>{
		 cl(data)
		let blogArr = blogObjToArr(data)
		createCards(blogArr)
		snackBar(`SuccessFully fetched ${blogArr.length} blogs.`, 'success')
	 })
	 .catch(err=>{
		 snackBar(err,'error')
	 })

}
 fetchAllBlogs()

function onPostBlog(eve){
	toggleSpinner(true)
	eve.preventDefault()
	
	let blogObj = {
		title:titleControl.value,
		content:contentControl.value,
		userId:userIdControl.value
	}
	
    blogForm.reset()
	
	makeApiCall(BLOG_URL, 'POST', blogObj)
	.then(data=>{
		
    let card = document.createElement("div")
	
	card.className = `card mb-4 shadow rounded`;
	card.id = data.name;
	card.innerHTML = 
	
	               `<div class="card-header">
						<h3 class="m-0 text-capitalize">${blogObj.title}</h3>
					</div>
					<div class="card-body">
						<p class="m-0">
						 ${blogObj.content}
						</p>
					</div>
					<div class="card-footer d-flex justify-content-between">
						<button class="btn btn-sm btn-outline-primary"  onclick = "onEdit(this)">Edit</button>
						<button class="btn btn-sm btn-outline-danger"  onclick = "onRemove(this)">Remove</button>
					</div>`
					
		postContainer.append(card)		

	   snackBar(`The blog who's Id is ${data.name} is added successFully!!!`,'success')
	})
	.catch(err=>{
		snackBar(err,'error')
	})
}

function onRemove(ele){
	toggleSpinner(true)
	Swal.fire({
	  title: "Are you sure?",
	  text: "You won't be able to revert this!",
	  icon: "warning",
	  showCancelButton: true,
	  confirmButtonColor: "#3085d6",
	  cancelButtonColor: "#d33",
	  confirmButtonText: "Yes, delete it!"
	}).then((result) => {
	  if (result.isConfirmed) {
		let Remove_Id = ele.closest('.card').id
		
		let Remove_Url = `${BASE_URL}/blogs/${Remove_Id}.json`
		
		makeApiCall(Remove_Url, 'DELETE', null)
		.then(data=>{
			ele.closest(".card").remove()
			snackBar(`The blog who's Id is ${Remove_Id} is removed successFully!!!`,'success')
		})
		.catch(err=>{
		snackBar(err,'error')
		})	
	  }
	});
	
}

function onEdit(ele){
	toggleSpinner(true)
	let Edit_Id = ele.closest(".card").id
	cl(Edit_Id)
	localStorage.setItem("Edit_Id", Edit_Id)
	
	let Edit_Url = `${BASE_URL}/blogs/${Edit_Id}.json`
	
	ele.parentElement.querySelector('.btn-outline-danger').disabled = true;
	
	   blogForm.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
    setTimeout(() => {
        titleControl.focus();
    }, 400); 
	
	makeApiCall(Edit_Url, 'GET', null)
	.then(data=>{
		
		titleControl.value = data.title;
		contentControl.value = data.content;
		userIdControl.value = data.userId;
		
		addBtn.classList.add("d-none")
		updateBtn.classList.remove("d-none")
	})
	.catch(err=>{
		snackBar(err,'error')
	})
}

function onUpdateBlog(){
	toggleSpinner(true)
	
	let Update_Id = localStorage.getItem("Edit_Id")
	
	let Updated_Obj = {
		title:titleControl.value,
		content:contentControl.value,
		userId:userIdControl.value
	}
	
	let Update_Url = `${BASE_URL}/blogs/${Update_Id}.json`
	
	makeApiCall(Update_Url, 'PATCH', Updated_Obj)
	.then(data=>{
	
	blogForm.reset()	
	let card = document.getElementById(Update_Id)
	card.querySelector(".card-header h3").innerText = data.title;
	card.querySelector(".card-body p").innerText = data.content;
	
	addBtn.classList.remove("d-none")
	updateBtn.classList.add("d-none")
	
    card.querySelector('.card-footer .btn-outline-danger').disabled = false;
	
	snackBar(`The blog who's Id is ${Update_Id} is updated successFully!!!`,'success')
	})
	.catch(err=>{
		snackBar(err,'error')
	})
}


blogForm.addEventListener("submit", onPostBlog)
updateBtn.addEventListener("click", onUpdateBlog)