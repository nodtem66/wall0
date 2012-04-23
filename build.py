#!/usr/bin/env python
#
# wall0 build script 0.0.1
# (c) 2011 Jirawat I.
# Licensed under the MIT License.
#
import re, getopt, sys, os, shutil, time, httplib, urllib, json

base_path = sys.path[0]
build_path = os.path.join(base_path, "build")
plugins_path = os.path.join(build_path, "plugins")
src_path =  os.path.join(base_path, "src\wall0")
src_excludes = ["core.js","gjs.js","plugins"]
import_excludes = ["wall0.js","icon.gif","plugins","loader.gif"]
main_js = "wall0.js"

#regex for only lib.js
lib_regex = re.compile(r"""define\(		# open define function
						(				# open group 1
						.*				# match all
						)				# close group 1
						\)\;			# close define function
						""", re.DOTALL | re.X)
#regex for Lib such as history.js
lib2_regex = re.compile(r"""define\(	# open define function
						(?:				# open temp group
							(?!			# not follow by this group
							return	# "return" word
							)
							.				# match all string, except "return" word
						)*				# close temp group
						return		# a first "return" word
						(					# open group 1
							.*			# collect all function
						)					# close group 1
						\;[\s]*		
						\}\)\;		# close define function
						""", re.DOTALL | re.X)

def main():
	try:
		opts, args = getopt.getopt(sys.argv[1:], 
			"hcqb:",["help","clean","queue","build="])
	except getopt.GetoptError, err:
		print str(err)
		usage()
		sys.exit(2)
	for o,a in opts:
		if o in ("-h","--help"):
			usage()
			sys.exit()
		elif o in ("-c","--clean"):
			clean()
			sys.exit()
		elif o in ("-b","--build"):
			build(a)
			sys.exit()
		elif o in ("-q","--queue"):
				queue()
		else:
			assert False, "unknown option"
def usage():
	print """
	Basepath: {}
	Usage ./build.py [OPTION]
	
	-h, --help		Help
	-c, --clean		Clean build
	-b type, --build=type	Build file ('product' or 'devel')
	-q, --queue		Queue mode
	""".format(sys.path[0])
	
def clean():
	print "Clean"
	shutil.rmtree(build_path)
	os.mkdir(build_path)
	
def build(type="product"):
	if type not in ("devel","product","prod"):
		type = "product"
	clean()
	print """
Build	    %(T)s
BaseDir	    %(P)s
BuildDir    %(B)s
SrcDir	    %(S)s

Copy files...
""" % {"T":type,"P":base_path,"B":build_path,"S":src_path}
	#copy all files from src dir to build dir
	for file in os.listdir(src_path):
		if os.path.isdir(os.path.join(src_path, file)):
			shutil.copytree(os.path.join(src_path, file), plugins_path)
		elif file not in src_excludes:
			shutil.copyfile(os.path.join(src_path, file), 
				os.path.join(build_path, file))
	parse(type)
	cleartemp()
	
def parse(type="devel"):

	file_main_js = open(os.path.join(src_path, main_js),'r')
	main_js_content = ''.join(file_main_js.readlines())
	file_main_js.close()
	file_main_js = open(os.path.join(build_path, main_js),'w')

	for file in os.listdir(build_path):
		if file not in import_excludes:
			filename = os.path.join(build_path, file)
			token = "IMPORT_" + file.split(".")[0].upper()
			
			tempfile = open(filename)
			content = ''.join(tempfile.readlines())
			if file == "lib.js":
				content = lib_regex.sub(r'\1',content)
			else:
				content = lib2_regex.sub(r'\1',content)
				
			main_js_content = main_js_content.replace(token, content)
			tempfile.close()

	if type in ("product","prod"):
		print "Minify wall0.js"
		main_js_content = minify(comment(main_js_content))
		if len(main_js_content.strip()) > 3:
			file_main_js.write(main_js_content)
		for file in os.listdir(plugins_path):
			print "Minify", file
			plugins_js = open(os.path.join(plugins_path, file), 'r')
			plugin_content = ''.join(plugins_js.readlines())
			plugin_content = minify(comment(plugin_content))
			plugins_js.close()
			if len(plugin_content.strip()) > 3:
				plugins_js = open(os.path.join(plugins_path, file), 'w')
				plugins_js.write(plugin_content)
				plugins_js.close()
	else:
		file_main_js.write(main_js_content)
	file_main_js.close()		

def queue():
	clean()
	os.mkdir(plugins_path)
	print "Queue..."
	m = []; path = []; len = 0;
	i = 0; manage = managerFile()
	manage.next()
	listfile = os.listdir(src_path)
	for file in os.listdir(os.path.join(src_path, "plugins")):
		listfile.append("plugins/"+file)
	for file in listfile:
		if file not in src_excludes:
			path.append(os.path.join(src_path,file))
			shutil.copyfile(path[len], 
				os.path.join(build_path, file))
			m.append(monitorFile(file, manage))
			m[len].next()
			m[len].send(os.stat(path[len]).st_mtime)
			len += 1
	parse()		
	
	
	try:
		while True:
			m[i].send(os.stat(path[i]).st_mtime)
			i += 1
			if i == len:
				i = 0
				time.sleep(0.5)
	except (KeyboardInterrupt, SystemExit):
		cleartemp()
		raise
	except:
		cleartemp()
	
def cleartemp():
	#remove temp file in build dir
	for file in os.listdir(build_path):
		if file not in import_excludes:
			os.remove(os.path.join(build_path, file))
			
def	monitorFile(filename, target):
	print 'Start monitor {}'.format(filename)
	lastEditTime = (yield)
	while True:
		newEditTime = (yield)
		if lastEditTime == newEditTime:
			continue
		print 'Update file {}'.format(filename)
		lastEditTime = newEditTime
		try:
			target.send(filename)
		except:
			break
			
def managerFile():
	while True:
		try:
			filename = (yield)
		except:
			cleartemp()
			break	
		shutil.copy(os.path.join(src_path, filename), 
			os.path.join(build_path, filename))
		parse()
		
def comment(code):
	comment_regex = re.compile(r"""(console.log\(.*\)\;)""", re.X | re.M)
	code = comment_regex.sub('',code)
	return code
def minify(code):
	
	params_checkerrors = urllib.urlencode([
		('js_code', code),
		('compilation_level','SIMPLE_OPTIMIZATIONS'),
		('output_format','json'),
		('output_info','errors')
	])
	params_minify = urllib.urlencode([
		('js_code', code),
		('compilation_level','SIMPLE_OPTIMIZATIONS'),
		('output_format','text'),
		('output_info','compiled_code')
	])
	headers = { "Content-type": "application/x-www-form-urlencoded" }
	conn = httplib.HTTPConnection('closure-compiler.appspot.com')
	conn.request('POST', '/compile', params_checkerrors, headers)
	response = conn.getresponse()
	data = json.loads(response.read())
	if data.has_key('errors'):
		print "\tJS Syntax error"
		for error in data['errors']:
			print "\tline  %d %d:( %s ) %s" % (error['lineno'],error['charno'],error['error'],error['line'])
		return ''
	else:
		conn.request('POST', '/compile', params_minify, headers)
		response = conn.getresponse()
		data = response.read()
		conn.close()
		return data
if __name__ == "__main__":
	main()
else:
	print "not main"