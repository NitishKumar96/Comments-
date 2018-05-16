'use babel';
/*jshint esversion: 6 */
import CommentsView from './comments-view';
import { CompositeDisposable } from 'atom';

export default {

  commentsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.commentsView = new CommentsView(state.commentsViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.commentsView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'comments:toggle': () => this.toggle(),
      'comments:checkLine': () => this.checkLine(),
      'comments:print_comment':()=> this.print_comment(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.commentsView.destroy();
  },

  serialize() {
    return {
      commentsViewState: this.commentsView.serialize()
    };
  },

  toggle()
  {
    let editor=atom.workspace.getActiveTextEditor();
    if (editor)
    {
    let selection = editor.getSelectedText();
    let reversed = selection.split('').reverse().join('');
    // editor.insertText(reversed);
    editor.insertText("\n my name is Nitish");
    }
  },

  checkLine() // this is the main function called after every enter press
    {
        let Texteditor=atom.workspace.getActiveTextEditor();  // make an object of active text editor

        if (Texteditor) // if the editor is present
        {
          if (Texteditor.getTitle().split(".")[1]=="js") // hence the file is in java script
            {

                // take the current cursor by the buffer
                var cursor_position = Texteditor.getCursorBufferPosition();
                // make object for the current buffer
                var buffer = Texteditor.getBuffer();
                // take the line number from the cursore position point
                var lineNo= cursor_position.row; // used in checking the description
                // store the current line into the string
                let text = Texteditor.lineTextForBufferRow(cursor_position.row);

                // check for the line is comment or not
                // var block_comment_start=new RegExp('/*');
                // var block_comment_end=new RegExp('*/');
                var block_comment_status=0;   // var to represent the status of the block comment
                // var comment= new RegExp('//');
                var comment_status=0;   // var to represent general comment status

                if (text.includes('//')) // check for the normal comment
                {
                  comment_status=1;
                }
                else
                {
                  comment_status=0
                }

                if (text.includes('/*'))  // check for the block comment
                {
                  block_comment_status=1;
                }
                else if (text.includes('*/'))
                {
                  block_comment_status=0;
                }

                if (block_comment_status==0 && comment_status==0) // if it is not comment
                {
                  var functions= new RegExp('function');
                  var indent=Texteditor.indentationForBufferRow(cursor_position.row);
                  var classes= new RegExp('class');

                  // if it is function
                  if (functions.test(text))
                  {
                      // check whether the comment is already there or not
                      var already_present=0; // 1 if the description is already there
                      var i;
                      if (lineNo>0)
                        {
                          for ( i=0; i<5; i++)
                          {
                            lineNo-=1;
                            line=Texteditor.lineTextForBufferRow(lineNo);

                            if (line.length!=0)// line have some data
                            {
                              if (line.includes("fun_des_end")) // line contains data, check it contains the comment end
                              { already_present=1;
                                break;
                              }
                              else {    // if no comment is present
                                already_present=0;
                                break;
                              }
                            }
                            // else{ continue;}
                            if (lineNo===0) break;
                          }
                        }

                      // check the type of declaration
                      dec_type=0;// basic value
                      if (text.replace(/ /g,'').indexOf('function')===0) dec_type=1; // i.e. the simple declaration

                      if (already_present==0) // donot have the description block
                        {
                          // analyze the data from the current line
                          var string_data = text.trim().split(" ");

                          // revore the text from the current line
                          buffer.deleteRow(cursor_position.row);

                          // add the comment block for the function
                          Texteditor.insertText("\n")
                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("/*** Function *** \n");
                          // print the function name
                          let function_name=string_data[string_data.indexOf("function")+1];
                          function_name= function_name.split("(")[0];
                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("* Name:  "+function_name+"\n");

                          // print obj taken by the function
                          let startb= text.indexOf("("); // store the index of ( )
                          let endb=text.indexOf(")");
                          var i, obj="";
                          // take all the objects given in the defination
                          for (i=startb+1; i< endb;i+=1){
                            obj= obj+ text[i];
                          }
                          let obj_str=obj.split(",");
                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("* Parameters:  \n");
                          for (i=0;i<obj_str.length;i+=1){
                            for (a=indent;a>0;a--)
                            {
                              Texteditor.insertText("\t");
                            }
                            Texteditor.insertText("* \t\t\t\t=> "+obj_str[i].trim()+"\n");
                          }

                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("* Returns: \n");

                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("-- fun_des_end --*/\n");

                          // rewrite the function line in a proper way
                          let declaration="function"+" "+function_name+"("+String(obj_str)+")";

                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText(declaration+"\n");

                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("{\n\n\n");
                          for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("}");
                          lineNo = Texteditor.getCursorBufferPosition();
                          lineNo.row-=3;
                          Texteditor.setCursorBufferPosition(lineNo);
                          // for (i=indent;i>0;i--) Texteditor.insertText("\t");
                          Texteditor.insertText("\t");
                      }
                  }
                }


              }

          else if (Texteditor.getTitle().split(".")[1]=="py") // hence the file is in python
              {

                // take the current cursor by the buffer
                var cursor_position = Texteditor.getCursorBufferPosition();
                // make object for the current buffer
                var buffer = Texteditor.getBuffer();
                // take the line number from the cursore position point
                var lineNo= cursor_position.row; // used in checking the description
                // store the current line into the string
                let text = Texteditor.lineTextForBufferRow(cursor_position.row);

                // check for the line is comment or not
                // var block_comment_start=new RegExp('/*');
                // var block_comment_end=new RegExp('*/');
                // var block_comment_status=0;   // var to represent the status of the block comment
                // var comment= new RegExp('//');
                var comment_status=0;   // var to represent general comment status

                if (text.includes('#')) // check for the normal comment
                {
                  comment_status=1;
                }
                else
                {
                  comment_status=0
                }

                // if (text.includes('/*'))  // check for the block comment
                // {
                //   block_comment_status=1;
                // }
                // else if (text.includes('*/'))
                // {
                //   block_comment_status=0;
                // }
                //
                if (comment_status==0) // if it is not comment
                {
                  var functions= new RegExp('def');
                  var classes= new RegExp('class');
                  var indent=Texteditor.indentationForBufferRow(cursor_position.row);

                  // if it is function
                  if (functions.test(text))
                  {
                      // check whether the comment is already there or not
                      var already_present=0; // 1 if the description is already there
                      var i;
                      if (lineNo>0)
                        {
                          for ( i=0; i<5; i++)
                          {
                            lineNo-=1;
                            line=Texteditor.lineTextForBufferRow(lineNo);
                            if (line.length!=0)// line have some data
                            {
                              if (line.includes("fun_des_end")) // line contains data, check it contains the comment end
                              { already_present=1;
                                break;
                              }
                              else {    // if no comment is present
                                already_present=0;
                                break;
                              }
                            }
                            if (lineNo==0) break;
                          }
                        }
                      if (already_present==0)
                        {
                        // analyze the data from the current line
                        var string_data = text.trim().split(" ");
                        // revore the text from the current line
                        buffer.deleteRow(cursor_position.row);

                        Texteditor.insertText("\n");
                        // for loop to add the indentation
                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText("#*** Functions *** \n");

                        // print the function name
                        let function_name=string_data[string_data.indexOf("def")+1];
                        function_name= function_name.split("(")[0];
                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText("# Name:  "+function_name+"\n");

                        // print obj taken by the function
                        let startb= text.indexOf("("); // store the index of ( )
                        let endb=text.indexOf(")");
                        var i, obj="";
                        // take all the objects given in the defination
                        for (i=startb+1; i< endb;i+=1){
                          obj= obj+ text[i];
                        }
                        let obj_str=obj.split(",");
                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText("# Parameters:  \n");
                        for (i=0;i<obj_str.length;i+=1){
                          for (a=indent;a>0;a--)
                          {
                            Texteditor.insertText("\t");
                          }
                          Texteditor.insertText("# \t=> "+obj_str[i].trim()+"\n");
                        }
                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText("# Returns: \n");

                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText("#-- fun_des_end --\n");

                        // rewrite the function line in a proper way
                        let declaration="def"+" "+function_name+"("+String(obj_str)+"):";
                        for (i=indent;i>0;i--) Texteditor.insertText("\t");
                        Texteditor.insertText(declaration+"\n");
                        for (i=indent+1;i>0;i--) Texteditor.insertText("\t");
                        // Texteditor.insertText("\n\n\n");
                        // lineNo = Texteditor.getCursorBufferPosition();
                        // lineNo.row-=1;
                        // Texteditor.setCursorBufferPosition(lineNo);
                        // Texteditor.insertText(lineNo);
                      }
                  }
                }

          }


          Texteditor.insertText("\n");
          // if it is not js file or not fn
          //donot place in else function


        }


        else{     // file type is not recognized, so no action taken
          Texteditor.insertText("\n"); // print new line
        }


    }

};
