If (WScript.Arguments.Count <> 2) Then
	WScript.Quit
End If

url = WScript.Arguments(0)
file = WScript.Arguments(1)

Set objFSO = Createobject("Scripting.FileSystemObject")
If objFSO.Fileexists(file) Then
	Set objFSO = Nothing
	WScript.Quit
End If

Set objXMLHTTP = CreateObject("MSXML2.XMLHTTP")
objXMLHTTP.open "GET", url, false
objXMLHTTP.send()

If objXMLHTTP.Status = 200 Then
	Set objADOStream = CreateObject("ADODB.Stream")
	objADOStream.Open
	objADOStream.Type = 1
	objADOStream.Write objXMLHTTP.ResponseBody
	objADOStream.Position = 0
	objADOStream.SaveToFile file
	objADOStream.Close
	Set objADOStream = Nothing
End If

Set objFSO = Nothing
Set objXMLHTTP = Nothing
