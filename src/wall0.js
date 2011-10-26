define(['wall0/editor'],function(editor){
	if(typeof this.wall0 == "function")
		this.wall0 = editor;
	else
		this.wall0 = editor(wall0);
});