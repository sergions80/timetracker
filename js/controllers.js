var timeTrackerModule = angular.module('timeTracker', ['LocalStorageModule']);

timeTrackerModule.filter('crono', function() {
    return function(input, hideSegundos) {
		//var hora = Math.floor(((input/86400)%1)*24);
		var hora = Math.floor(((input/86400)%1)*24);
		hora = hora < 10 ? ("0" + hora) : hora;

		var minuto = Math.floor(((input/3600)%1)*60);
		minuto = minuto < 10 ? ("0" + minuto) : minuto;

		var segundo = Math.round(((input/60)%1)*60);
		segundo = segundo < 10 ? ("0" + segundo) : segundo;
		
		return hora + ":" + minuto + (hideSegundos ? "" : (":" + segundo));
    }
});

timeTrackerModule.controller('TimeTrackerCtrl', function($scope, localStorageService) {
	var contadorTempo;

	$scope.tarefas = JSON.parse(localStorageService.get("tarefas")) || [];

	setInterval(function(){$scope.persistirTarefas()},60000);
	
	var contarTempo = function(tempo){		
		contadorTempo = setInterval(function(){
			tempo.segundos++;			
			$scope.$apply();
		},1000);
	}

	$scope.addTarefa = function(tarefa) {		
		var nome = tarefa.nome;
		var regexp = new RegExp('#([^\\s]*)','g');
		
		var ids = nome.match(regexp);
		tarefa.id = ids ? ids[0] : "#";
		
		tarefa.nome = nome.replace(regexp, '');

		$scope.tarefas.push(tarefa);
		$scope.tarefa = {};
	}

	$scope.removeTarefa = function(index) {
		$scope.tarefas.splice(index,1);
		$scope.persistirTarefas();
	}

	$scope.addTempo = function(tarefa) {
		tarefa.tempos = tarefa.tempos || [];

		var tempo = _.findWhere(tarefa.tempos, {criado_em: moment().format("DD/MM/YYYY")});
		if (!tempo) {
			tempo = {criado_em: moment().format("DD/MM/YYYY"), segundos: 0};							
			tarefa.tempos.push(tempo);
		}
		$scope.pararContador();
		contarTempo(tempo);

		$scope.persistirTarefas();	
	}

	$scope.pararContador = function() {
		clearInterval(contadorTempo);
	}

	$scope.persistirTarefas = function() {
		//localStorageService.clearAll();
		localStorageService.remove("tarefas");
		localStorageService.add("tarefas", JSON.stringify($scope.tarefas));
	}

	$scope.totalTempoTarefa = function(tarefa) {
		var tempoTotal = 0;
		_.each(tarefa.tempos, function(tempo){
			tempoTotal = tempoTotal + tempo.segundos;
		});
		return tempoTotal;
	}

});